from pydantic import BaseModel, Field


class RunSimulationRequest(BaseModel):
    simulator_id: str = Field(..., description="Simulator identifier")
    cloudlet_lengths: list[int] | None = Field(
        default=None,
        description="Optional cloudlet lengths for SGPFSFinal"
    )


class SimulatorInfo(BaseModel):
    id: str
    class_name: str
    name: str
    supports_custom_lengths: bool


class CloudletMetric(BaseModel):
    cloudlet_id: int
    status: str
    datacenter_id: int | None = None
    vm_id: int | None = None
    cpu_time: float | None = None
    start_time: float | None = None
    finish_time: float | None = None
    length: int | None = None


class ScheduleEntry(BaseModel):
    cloudlet_id: int
    length: int


class SimulationResponse(BaseModel):
    simulator_id: str
    simulator_class: str
    compile_log: str
    raw_output: str
    summary: dict
    cloudlets: list[CloudletMetric]
    schedule_order: list[ScheduleEntry]
