sm-clean: 
	cd ./marketplace-smart-contract; \
	npx hardhat clean

sm-compile:
	cd ./marketplace-smart-contract; \
	npx hardhat compile

sm-build: 
	make sm-clean
	make sm-compile
	make copy-artifacts

sm-deploy-local:
	cd ./marketplace-smart-contract; \
	npx hardhat run scripts/deploy.ts --network localhost

sm-deploy-ganache:
	cd ./marketplace-smart-contract; \
	npx hardhat run scripts/deploy.ts --network ganache

run-node:
	cd ./marketplace-smart-contract; \
	npx hardhat node

copy-artifacts:
	rm -rf ./marketplace-eth/contracts
	mkdir ./marketplace-eth/contracts
	cp -R ./marketplace-smart-contract/artifacts ./marketplace-eth/contracts/artifacts
	cp -R ./marketplace-smart-contract/typechain ./marketplace-eth/contracts/typechain