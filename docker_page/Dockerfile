FROM ubuntu:18.04

COPY abroad /dist/abroad
COPY run.sh /dist/run.sh

WORKDIR /dist

RUN ["chmod", "755", "run.sh"]

ENTRYPOINT ["/bin/bash", "run.sh"]
