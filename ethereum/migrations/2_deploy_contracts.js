const fs = require('fs');
const timeUtil = require('../../util/time.util');
const ElectionFactory = artifacts.require('./ElectionFactory.sol');
const Election = artifacts.require('./Election.sol');
const hec = require('../../hec/hec');
const ipfs = require('../../ipfs/ipfs');

module.exports = (deployer, network, accounts) =>
    deployer.then(async () => {
        await deployer.deploy(ElectionFactory);
        const deployedVoteFactory = await ElectionFactory.deployed();

        // 공개키를 만든 후
        hec.createKeys(accounts[1], 10007, 7, async () => {
            // IPFS에 저장합니다
            const publicKeyFilePath = "../../hec/data/publicKey/" + accounts[1] + ".bin";
            const publicKeyFile = fs.readFileSync(publicKeyFilePath);
            ipfs.files.add(new Buffer.from(publicKeyFile), async (err, file) => {
                if (err) console.log(err);
                console.debug(file);
                const publicKeyFileHash = file[0].hash;
                await deployedVoteFactory.makeNewVote(
                    '한밭대학교 총학생회장 선거',
                    '2018년도 총학생회장 선거를 개최합니다. \n' +
                    '총학생회는 학생들의 자율적인 의사에 따라 이루어진 자치기구로서 자주 학원건설의 길로 새로운 시작의 발걸음을 시작할 것입니다. \n' +
                    '작은 발걸음부터 시작하지만 그 작은 약속을 가장 소중히 생각하며 새로운 희망의 씨를 뿌리는 자주학원 건설을 위한 총학생회를 만들 것입니다.',
                    accounts[1],
                    timeUtil.dateStringToTimestamp('09/06/2018 08:30:00'),
                    timeUtil.dateStringToTimestamp('09/15/2018 22:00:00'),
                    publicKeyFileHash,
                    false
                );

                const deployedPublicVotes = await deployedVoteFactory.getDeployedElections(false).call(false);
                // const deployedQkxeoVotes = await deployedVoteFactory.getDeployedVotes.call(false);
                console.log('밭대선거 : ' + deployedPublicVotes[0]);

                // 한밭대선거 투표에 후보자 추가
                const deployedPrivateVote = await Election.at(deployedPublicVotes[0]);
                const privateCandidateList = ['악센트', '라우드', '비포유'];
                const privateCandidateCommitment = [
                    'https://www.facebook.com/496324237400491/photos/pcb.500330310333217/500330110333237/?type=3&theater',
                    'https://www.facebook.com/348577105502407/photos/pcb.348811022145682/348810525479065/?type=3&theater',
                    'https://www.facebook.com/beforu.hanbat/photos/a.1099073166799222.1073741828.1099070860132786/1100406446665894/?type=3&theater'
                ];
                for (let i = 0; i < privateCandidateList.length; i++) {
                    await deployedPrivateVote.addCandidate(
                        privateCandidateList[i],
                        privateCandidateCommitment[i],
                        {from: accounts[1]}
                    );
                    // const addedCandidate2 = await deployedPrivateVote.getCandidate.call(i);
                    // await console.log(addedCandidate2);
                }

                // 파일에 저장
                await fs.open('./config/contract-address.json', 'w', (err, fd) => {
                    if (err) throw 'error opening file: ' + err;
                    const jsonObj = {
                        factory: deployedVoteFactory.address,
                        test_qkxeo_contract: deployedPublicVotes[0],
                        test_qkxeo_address: accounts[1]
                    };
                    fs.writeFile('./config/contract-address.json',
                        new Buffer.from(JSON.stringify(jsonObj)), 'utf8', (err) => {
                            if (err) throw 'error writing file: ' + err;
                            fs.close(fd, () => console.log(JSON.stringify(jsonObj)));
                        });
                });
            });
        });
    });