
OBJS=index.html

all: $(OBJS)

index.html: index.jade framework.jade utility.jade
	cat index.jade | jade -P -p. > index.html

clean:
	rm -rf $(OBJS)

