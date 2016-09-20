FROM	fedora:24
RUN	dnf install -y gcc-c++
RUN	dnf install -y node
RUN	dnf install -y npm
RUN	dnf install -y zeromq-devel
RUN	dnf install -y python
RUN	dnf install -y make
RUN	mkdir /usr/src/app
ADD	package.json /usr/src/app
WORKDIR	/usr/src/app
RUN	npm install
ADD	classes /usr/src/app/classes
ADD	index.js /usr/src/app
CMD	[ "node", "./index.js" ]
