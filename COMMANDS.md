npx hardhat run scripts/01-diamond-deploy-cut.ts --network mumbai
npx hardhat run scripts/02-diamond-verify.ts --network mumbai
npx hardhat run scripts/03-diamond-upgrade-add.ts --network mumbai
npx hardhat run scripts/04-diamond-upgrade-remove.ts --network mumbai
npx hardhat run scripts/05-diamond-upgrade-replace.ts --network mumbai

(MANUALLY VERIFY) npx hardhat verify 0x377C0558d7771e78B941e2A79436Bf5ac4bDE317 --network mumbai

ref: https://louper.dev/diamond/0xe1130dEa5FBEdA08Cf52f6a2aA087Ed94AEd505a?network=mumbai
