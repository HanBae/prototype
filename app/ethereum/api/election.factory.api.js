const ElectionFactory = require('../factory');

const getOwner = async () =>
    await ElectionFactory.methods.owner().call();

const getDeployedElections = async (isFinite) =>
    await ElectionFactory.methods.getDeployedElections(isFinite).call();

const getDeployedElectionsLength = async (isFinite) =>
    await ElectionFactory.methods.getDeployedElectionsLength(isFinite).call();

const makeNewElection = async (adminAddress,
                           electionName,
                           electionDescription,
                           electionOwner,
                           startDate,
                           endDate,
                           finiteElection) =>
    await ElectionFactory.methods.makeNewElection(
        electionName,
        electionDescription,
        electionOwner,
        startDate,
        endDate,
        finiteElection
    ).send({from: adminAddress, gas: 5000000});

module.exports = {
    getOwner,
    getDeployedElections,
    getDeployedElectionsLength,
    makeNewElection
};
