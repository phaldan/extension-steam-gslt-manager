.PHONY: all dev dist

UID=$(shell id -u)
GID=$(shell id -g)
IMAGE=node:6.16.0-alpine
CONTAINER=steam-gslt
DOCKER=$(shell which docker.io || which docker)
PARAMS=--rm -it --name=$(CONTAINER) -v=${PWD}:/app -w=/app -u=$(UID):$(GID)

all:
	$(DOCKER) run $(PARAMS) --network=host $(IMAGE) /bin/ash

dev:
	$(DOCKER) run $(PARAMS) --network=host $(IMAGE) yarn dev

dist:
	$(DOCKER) run $(PARAMS) $(IMAGE) yarn dist

