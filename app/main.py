from __future__ import annotations

import os
import re
import shutil
import subprocess
from pathlib import Path

from fastapi import FastAPI, HTTPException

from .models import (
    CloudletMetric,
    RunSimulationRequest,
    ScheduleEntry,
    SimulationResponse,
    SimulatorInfo,
)

app = FastAPI(title="CloudSim Runner API", version="1.0.0")

ROOT_DIR = Path(__file__).resolve().parents[1]
BUILD_DIR = ROOT_DIR / "build" / "classes"

SIMULATORS: dict[str, SimulatorInfo] = {
    "cloudsim-example-1": SimulatorInfo(
        id="cloudsim-example-1",
        class_name="org.cloudbus.cloudsim.examples.CloudSimExample1",
        name="CloudSim Example 1",
        supports_custom_lengths=False,
    ),
    "cloudsim-example-2": SimulatorInfo(
        id="cloudsim-example-2",
        class_name="org.cloudbus.cloudsim.examples.CloudSimExample2",
        name="CloudSim Example 2",
        supports_custom_lengths=False,
    ),
    "sgpfs-final": SimulatorInfo(
        id="sgpfs-final",
        class_name="org.cloudbus.cloudsim.SGPFSFinal",
        name="SGPFS Final (Custom Length Input)",
        supports_custom_lengths=True,
    ),
}


@app.get("/api/health")
def health() -> dict:
    return {"status": "ok"}


@app.get("/api/simulators", response_model=list[SimulatorInfo])
def list_simulators() -> list[SimulatorInfo]:
    return list(SIMULATORS.values())


@app.post("/api/run", response_model=SimulationResponse)
def run_simulation(payload: RunSimulationRequest) -> SimulationResponse:
    simulator = SIMULATORS.get(payload.simulator_id)
    if simulator is None:
        raise HTTPException(status_code=400, detail="Unknown simulator_id")

    if simulator.supports_custom_lengths:
        lengths = payload.cloudlet_lengths or [5000, 10000, 20000, 30000, 40000]
        if not lengths or any(value <= 0 for value in lengths):
            raise HTTPException(
                status_code=400,
                detail="cloudlet_lengths must contain only positive integers",
            )
    else:
        lengths = None

    compile_log = compile_java_sources(simulator.class_name)
    run_result = execute_simulator(simulator.class_name, lengths)

    if run_result.returncode != 0:
        raise HTTPException(
            status_code=500,
            detail={
                "message": "Simulation process failed",
                "stdout": run_result.stdout,
                "stderr": run_result.stderr,
            },
        )

    raw_output = run_result.stdout
    cloudlets, schedule_order = parse_output(raw_output)
    summary = build_summary(cloudlets)

    return SimulationResponse(
        simulator_id=simulator.id,
        simulator_class=simulator.class_name,
        compile_log=compile_log,
        raw_output=raw_output,
        summary=summary,
        cloudlets=cloudlets,
        schedule_order=schedule_order,
    )


def compile_java_sources(class_name: str) -> str:
    javac_path, _ = resolve_java_tools()

    source_file = resolve_simulator_source_file(class_name)

    BUILD_DIR.mkdir(parents=True, exist_ok=True)

    compile_proc = subprocess.run(
        [
            javac_path,
            "-d",
            str(BUILD_DIR),
            "-sourcepath",
            str(ROOT_DIR),
            str(source_file),
        ],
        cwd=ROOT_DIR,
        capture_output=True,
        text=True,
        check=False,
    )

    if compile_proc.returncode != 0:
        raise HTTPException(
            status_code=500,
            detail={
                "message": "Compilation failed",
                "stdout": compile_proc.stdout,
                "stderr": compile_proc.stderr,
            },
        )

    return compile_proc.stdout + ("\n" + compile_proc.stderr if compile_proc.stderr else "")


def resolve_simulator_source_file(class_name: str) -> Path:
    relative_path = Path(*class_name.split(".")).with_suffix(".java")
    candidates = [ROOT_DIR / "examples" / relative_path, ROOT_DIR / relative_path]
    for candidate in candidates:
        if candidate.exists():
            return candidate

    raise HTTPException(
        status_code=500,
        detail={
            "message": "Simulator source file not found",
            "class_name": class_name,
        },
    )


def execute_simulator(class_name: str, lengths: list[int] | None) -> subprocess.CompletedProcess[str]:
    _, java_path = resolve_java_tools()

    stdin_data = None
    if lengths is not None:
        stdin_data = f"{len(lengths)}\n" + "\n".join(str(item) for item in lengths) + "\n"

    return subprocess.run(
        [java_path, "-cp", str(BUILD_DIR), class_name],
        cwd=ROOT_DIR,
        input=stdin_data,
        capture_output=True,
        text=True,
        check=False,
    )


def parse_output(output: str) -> tuple[list[CloudletMetric], list[ScheduleEntry]]:
    cloudlets: list[CloudletMetric] = []
    schedule_order: list[ScheduleEntry] = []

    schedule_pattern = re.compile(r"Cloudlet\s+(\d+)\s+Length=(\d+)")
    success_pattern = re.compile(
        r"^\s*(\d+)\s+SUCCESS\s+(\d+)\s+(\d+)\s+([0-9.]+)\s+([0-9.]+)\s+([0-9.]+)"
    )
    sgpfs_pattern = re.compile(
        r"^\s*(\d+)\s*\|\s*([0-9.]+)\s*\|\s*([0-9.]+)\s*\|\s*(\d+)\s*$"
    )

    for raw_line in output.splitlines():
        line = raw_line.strip()
        if not line:
            continue

        schedule_match = schedule_pattern.search(line)
        if schedule_match:
            schedule_order.append(
                ScheduleEntry(
                    cloudlet_id=int(schedule_match.group(1)),
                    length=int(schedule_match.group(2)),
                )
            )
            continue

        success_match = success_pattern.match(line)
        if success_match:
            cloudlets.append(
                CloudletMetric(
                    cloudlet_id=int(success_match.group(1)),
                    status="SUCCESS",
                    datacenter_id=int(success_match.group(2)),
                    vm_id=int(success_match.group(3)),
                    cpu_time=float(success_match.group(4)),
                    start_time=float(success_match.group(5)),
                    finish_time=float(success_match.group(6)),
                )
            )
            continue

        sgpfs_match = sgpfs_pattern.match(line)
        if sgpfs_match:
            cloudlets.append(
                CloudletMetric(
                    cloudlet_id=int(sgpfs_match.group(1)),
                    status="SUCCESS",
                    start_time=float(sgpfs_match.group(2)),
                    finish_time=float(sgpfs_match.group(3)),
                    length=int(sgpfs_match.group(4)),
                )
            )

    return cloudlets, schedule_order


def build_summary(cloudlets: list[CloudletMetric]) -> dict:
    if not cloudlets:
        return {
            "total_cloudlets": 0,
            "finished_cloudlets": 0,
            "makespan": 0.0,
            "avg_start_time": 0.0,
            "avg_finish_time": 0.0,
        }

    start_values = [item.start_time for item in cloudlets if item.start_time is not None]
    finish_values = [item.finish_time for item in cloudlets if item.finish_time is not None]

    total = len(cloudlets)
    finished = len([item for item in cloudlets if item.status == "SUCCESS"])
    makespan = (max(finish_values) - min(start_values)) if start_values and finish_values else 0.0

    return {
        "total_cloudlets": total,
        "finished_cloudlets": finished,
        "makespan": round(makespan, 4),
        "avg_start_time": round(sum(start_values) / len(start_values), 4) if start_values else 0.0,
        "avg_finish_time": round(sum(finish_values) / len(finish_values), 4) if finish_values else 0.0,
    }


def resolve_java_tools() -> tuple[str, str]:
    java_home = os.environ.get("JAVA_HOME")
    if java_home:
        home = Path(java_home)
        javac_home = home / "bin" / "javac.exe"
        java_home_exe = home / "bin" / "java.exe"
        if javac_home.exists() and java_home_exe.exists():
            return str(javac_home), str(java_home_exe)

    javac_path = shutil.which("javac")
    java_path = shutil.which("java")
    if javac_path and java_path:
        return javac_path, java_path

    fallback_roots = [
        Path.home() / ".vscode" / "extensions",
        Path("C:/Program Files"),
        Path("C:/Program Files (x86)"),
    ]

    javac_candidates: list[Path] = []
    java_candidates: list[Path] = []

    for root in fallback_roots:
        if not root.exists():
            continue
        javac_candidates.extend(root.glob("**/bin/javac.exe"))
        java_candidates.extend(root.glob("**/bin/java.exe"))

    if javac_candidates and java_candidates:
        javac_candidate = sorted(javac_candidates)[0]
        java_candidate = sorted(java_candidates)[0]
        return str(javac_candidate), str(java_candidate)

    raise HTTPException(
        status_code=500,
        detail={
            "message": "Java toolchain not found. Install JDK 17+ or set JAVA_HOME.",
            "hint": "Expected javac and java in PATH, JAVA_HOME, or VS Code Java extension runtime.",
        },
    )
