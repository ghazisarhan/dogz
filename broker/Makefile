naemon:
	gcc -ljansson -Wall -lzmq -fPIC -shared -o dispatcher.o dispatcher.c

nagios:
	gcc -ljansson -Wall -lzmq -fPIC -shared -DNAGIOS -DNSCORE -o dispatcher.o dispatcher.c

clean:
	rm -rf dispatcher.o
