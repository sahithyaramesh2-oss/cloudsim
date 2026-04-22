package org.cloudbus.cloudsim;

import java.util.*;
import org.cloudbus.cloudsim.core.CloudSim;
import org.cloudbus.cloudsim.provisioners.*;

public class SGPFSFinal {

    private static final Scanner INPUT = new Scanner(System.in);

    public static void main(String[] args) {

        try {
            CloudSim.init(1, Calendar.getInstance(), false);

            Datacenter datacenter = createDatacenter("Datacenter_1");

            DatacenterBroker broker = new DatacenterBroker("Broker");
            int brokerId = broker.getId();

            Vm vm = new Vm(
                    0, brokerId, 1000, 1, 512, 1000, 10000,
                    "Xen", new CloudletSchedulerSpaceShared());

            broker.submitVmList(Arrays.asList(vm));

            // CLOUDLETS
            List<Cloudlet> cloudletList = new ArrayList<>();
            long[] lengths = readCloudletLengths();

            for (int i = 0; i < lengths.length; i++) {
                Cloudlet c = new Cloudlet(
                        i, lengths[i], 1, 300, 300,
                        new UtilizationModelFull(),
                        new UtilizationModelFull(),
                        new UtilizationModelFull());

                c.setUserId(brokerId);
                cloudletList.add(c);
            }

            
            cloudletList.sort(Comparator.comparingLong(Cloudlet::getCloudletLength));

            System.out.println("\nSGPFS Scheduling Order:");
            for (Cloudlet c : cloudletList) {
                System.out.println("Cloudlet " + c.getCloudletId()
                        + " Length=" + c.getCloudletLength());
            }

            
            for (Cloudlet c : cloudletList) {
                c.setVmId(vm.getId());
                broker.submitCloudletList(Arrays.asList(c));
            }

            CloudSim.startSimulation();

            List<Cloudlet> resultList = broker.getCloudletReceivedList();

            CloudSim.stopSimulation();

            printResults(resultList);

        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private static long[] readCloudletLengths() {

        int count = readPositiveInt("Enter number of cloudlets: ");
        long[] lengths = new long[count];

        for (int i = 0; i < count; i++) {
            lengths[i] = readPositiveLong("Enter length for cloudlet " + i + ": ");
        }

        return lengths;
    }

    private static int readPositiveInt(String prompt) {

        while (true) {
            System.out.print(prompt);
            if (!INPUT.hasNextInt()) {
                System.out.println("Please enter a valid integer.");
                INPUT.next();
                continue;
            }

            int value = INPUT.nextInt();
            if (value <= 0) {
                System.out.println("Value must be greater than 0.");
                continue;
            }

            return value;
        }
    }

    private static long readPositiveLong(String prompt) {

        while (true) {
            System.out.print(prompt);
            if (!INPUT.hasNextLong()) {
                System.out.println("Please enter a valid long integer.");
                INPUT.next();
                continue;
            }

            long value = INPUT.nextLong();
            if (value <= 0L) {
                System.out.println("Value must be greater than 0.");
                continue;
            }

            return value;
        }
    }

    private static Datacenter createDatacenter(String name) {

        List<Host> hostList = new ArrayList<>();

        List<Pe> peList = new ArrayList<>();
        peList.add(new Pe(0, new PeProvisionerSimple(1000)));

        hostList.add(new Host(
                0,
                new RamProvisionerSimple(2048),
                new BwProvisionerSimple(10000),
                1000000,
                peList,
                new VmSchedulerSpaceShared(peList)));

        DatacenterCharacteristics characteristics =
                new DatacenterCharacteristics(
                        "x86", "Linux", "Xen",
                        hostList,
                        10.0, 3.0,
                        0.05, 0.001, 0.0);

        try {
            return new Datacenter(
                    name,
                    characteristics,
                    new VmAllocationPolicySimple(hostList),
                    new LinkedList<>(),
                    0);
        } catch (Exception e) {
            e.printStackTrace();
        }

        return null;
    }

    private static void printResults(List<Cloudlet> list) {

        list.sort(Comparator.comparingDouble(Cloudlet::getExecStartTime));

        System.out.println("\n========== FINAL EXECUTION ORDER ==========");
        System.out.println("ID | Start | Finish | Length");

        for (Cloudlet c : list) {
            System.out.println(
                    c.getCloudletId() + " | " +
                    c.getExecStartTime() + " | " +
                    c.getFinishTime() + " | " +
                    c.getCloudletLength());
        }
    }
}