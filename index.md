---
layout: default
title: Makefile Tutorial by Example
---

**Intro**  
This makefile will always run. The default target is `some_binary`, because it is first.
{% highlight make %}
some_binary:
	echo "nothing"
{% endhighlight %}

**Intro**  
This file will make `some_binary` the first time, and the second time notice it's already made, resulting in `make: 'some_binary' is up to date.`
{% highlight make %}
some_binary:
	touch some_binary
{% endhighlight %}

**Intro**  
Alternative syntax: same line
{% highlight make %}
some_binary: ; touch some_binary
{% endhighlight %}

**Intro**  
\ gives us multilines
{% highlight make %}
some_binary: 
	touch \
some_binary
{% endhighlight %}

**Intro**  
Will call other.txt target if it is newer than the `some_binary` file, or it doesn't exist. It will call the other.txt rule first.
{% highlight make %}
some_binary: other.txt
	touch some_binary

other.txt:
	touch other.txt
{% endhighlight %}

**Intro**  
This will always make both targets, because `some_binary` depends on other.txt, which is never created.
{% highlight make %}
some_binary: other.txt
	touch some_binary

other.txt:
	echo "nothing"
{% endhighlight %}

**Intro**  
"clean" is not a special word. If there's a file called clean that is made, then "make clean" won't have to do anything. Similarly, if the clean file is older than the `some_binary` file, the clean rule will not be called.
{% highlight make %}
some_binary: clean
	touch some_binary

clean:
	touch clean

actual_clean:
	rm some_binary
	rm clean

# Adding PHONY to a target will prevent make from confusing the phony target with a file name.
# In this example, if clean is created, make clean will still be run.
# PHONY is great to use, but I'll skip it in the rest of the examples for simplicity.
some_binary:
	touch some_binary
	touch clean
 
.PHONY: clean
clean:
	rm some_binary
	rm clean
{% endhighlight %}

**2.4:**  
Variables can only be strings. Here's an example:
{% highlight make %}
files = file1 file2
some_binary: $(files)
	echo "Look at this variable: " $(files)
	touch some_binary

file1:
	touch file1
file2:
	touch file2
 
clean:
	rm file1 file2 some_binary
{% endhighlight %}



Here's a blah.c file that some examples below require
{% highlight c %}
#include<stdio.h>
#include <string.h>

int main()
{
   #printf("hello there\n");
   #return 0;
}
{% endhighlight %}

**2.5:**  
Example requires: blah.c  
If we have a target that is a ".c" file, there is an *implicit command* that will be "cc -c file.c -o file.o".
{% highlight make %}

# Implicit command of: "cc -c blah.c -o blah.o"
# Note: 1) Do not put a comment inside of the blah.o rule; the implicit rule will not run!
#       2) If there is no blah.c file, the implicit rule will not run and will not complain.
blah.o:
 
clean:
	rm blah.o
{% endhighlight %}

**4.1**  
Print literal '$'
{% highlight make %}
some_binary: 
	echo $$
{% endhighlight %}

**4.2**  
We can use wildcards in the target, prerequisits, or commands.  
Valid wildcards are `*, ?, [...]`  
{% highlight make %}
some_binary: *.c
	# create the binary

*.c:
	touch f1.c
	touch f2.c
 
clean:
	rm *.c

{% endhighlight %}

**4.2.3**  
We CANNOT use wildcards in other places, like variable declarations or function arguments  
Use the wildcard function instead.  
{% highlight make %}
wrong = *.o # Wrong
objects := $(wildcard *.c) # Right
some_binary: 
	touch f1.c
	touch f2.c
	echo $(wrong)
	echo $(objects)

clean:
	rm *.c


{% endhighlight %}

**4.3.2**  
Use vpath to specify where some set of prerequisites exist. The format is `vpath <pattern> <directories, space/colon seperated>`  
`<pattern>` can have a `%`, which matches any zero or more characters.  
You can also do this globallyish with the variable VPATH  
{% highlight make %}

vpath %.h ../headers ../other-directory

some_binary: ../headers blah.h
	touch some_binary

../headers:
	mkdir ../headers

blah.h:
	touch ../headers/blah.h

clean:
	rm -rf ../headers
	rm some_binary

{% endhighlight %}

**4.4**  
Making multiple targets? Make a phony 'all'!  
Note here PHONY is *after* all, because the target is seen as 'all' instead of PHONY,  
giving better error dumps.  
{% highlight make %}
all: one two three
PHONY: all

one:
	touch one
two:
	touch two
three:
	touch three

clean:
	rm one two three

{% endhighlight %}

**4.8**  
Multiple Targets: the rule will be run for each target  
`$@` is a *automatic variable* that contains the target name.
{% highlight make %}

all: f1.o f2.o

f1.o f2.o:
	echo $@
# Equivalent to:
# f1.o
# 	echo $@
# f2.o
# 	echo $@

clean:
	rm *.c

{% endhighlight %}

**4.8**  
Multiple Targets: We can use the wildcard % in targets, that captures zero or more of any character  
Note  
	1) We do not use *.o, because that is just the string *.o, which might be useful in the commands,  
but is only one target and does not expand.  
	2) PHONY is needed because otherwise make will create an automatic rule of "cc all.o f1.o f2.o -o all  
TODO why was this not a problem when I didn't use the % wildcard?
{% highlight make %}

all: f1.o f2.o
.PHONY: all

%.o:
	echo $@

clean:
	rm *.c
{% endhighlight %}

**4.10**  
Static Pattern Rules: each .o file has a prereq of the corresponding .c name  
Run "make init" first to make the .c files
{% highlight make %}
objects = foo.o bar.o

all: $(objects)

# targets ...: target-pattern: prereq-patterns ...
$(objects): %.o: %.c
	echo "make file" $@ "with prereqs" $<

init:
	touch foo.c
	touch bar.c

clean:
	rm foo.c bar.c

{% endhighlight %}

**4.10**  
filter can be used in Static pattern rules to match the correct files  
Run "make init" first to make the necessary files
{% highlight make %}

files = foo.elc bar.o lose.o
src_files = foo.el bar.c lose.c

all: $(files)

$(filter %.o,$(files)): %.o: %.c
	echo "target: " $@ "prereq: " $<
$(filter %.elc,$(files)): %.elc: %.el
	echo "target: " $@ "prereq: " $<

init:
	touch $(src_files)

clean:
	rm $(src_files)
{% endhighlight %}

**4.11**  
Double-Colon Rules are rarely used, but allow the same target to run commands from multiple targets.  
If these were single colons, an warning would be printed and only the second set of commands would run.
{% highlight make %}
all: blah

blah::
	echo "hello"

blah::
	echo "hello again"

clean:
	rm $(src_files)

{% endhighlight %}

**4.12**  
Example requires: blah.c  
Generating prereqs automatically  
This makes one small makefile per source file  
Notes:  
1) $$ is the current process id in bash. $$$$ is just $$, with escaping. We use it to make a temporary file, that doesn't interfere with others if there is some parallel builds going on.  
2) cc -MM outputs a makefile line. This is the magic that generates prereqs automatically, by looking at the code itself  
3) The purpose of the sed command is to translate (for example):  
    main.o : main.c defs.h  
    into:  
    main.o main.d : main.c defs.h  
4) Running `make clean` will rerun the rm -f ... rule because the include line wants to include an up to date version of the file. There is such a target that updates it, so it runs that rule before including the file.  
{% highlight make %}
all: blah.d

clean:
	rm blah.d

%.d: %.c
	rm -f $@; \
	 $(CC) -MM $(CPPFLAGS) $< > $@.$$$$; \
	 sed 's,\($*\)\.o[ :]*,\1.o $@ : ,g' < $@.$$$$ > $@; \
	 rm -f $@.$$$$

sources = blah.c

include $(sources:.c=.d)
{% endhighlight %}

**5.1**  
Add an @ before a command to stop it from being printed  
You can also run make with -s to add an @ before each line  
{% highlight make %}
all: 
	@echo "This make line will not be printed"
	echo "But this will"

{% endhighlight %}

**5.2**  
Each command is run in a new shell (or at least the affect is as such)
{% highlight make %}
all: 
	cd ..
	# The cd above does not affect this line, because each command is effectively run in a new shell
	echo `pwd`

	# This cd command affects the next because they are on the same line
	cd ..;echo `pwd`

	# Same as above
	cd ..; \
	echo `pwd`

{% endhighlight %}

**5.2**  
Note only: the default shell is /bin/sh. You can change this by changing the variable SHELL
{% highlight make %}


{% endhighlight %}

**5.4**  
Make stops running a rule (and will propogate back to prerequisites) if a command returns a nonzero exit status.  
`DELETE_ON_ERROR` will delete the target of a rule if the rule fails in this manner. This will happen for all targets, not just the one it is before like PHONY. It's a good idea to always use this, even though make does not for historical reasons.  
Add "-k" when running make to continue running even in the face of errors. Helpful if you want to see all the errors of Make at once.  
{% highlight make %}
.DELETE_ON_ERROR:
all: one two

one:
	touch one
	false

two:
	touch two
	false
{% endhighlight %}

**5.4**  
Add a "-" before a command to suppress the error  
Add "-i" to make to have this happen for every command.
{% highlight make %}
one:
	false
	touch one

{% endhighlight %}

**5.5**  
Note only: If you ctrl+c make, it will delete the newer targets it just made.
{% highlight make %}


{% endhighlight %}

**5.6**  
Recursively call a makefile. Use the special $(MAKE) instead of "make"  
because it will pass the make flags for you and won't itself be affected by them.
{% highlight make %}
new_contents = "\
hello:\\n\
\\ttouch inside_file"
all:
	mkdir -p subdir
	echo $(new_contents) | sed -e 's/^ //' > subdir/makefile
	cd subdir && $(MAKE)

clean:
	rm -rf subdir

{% endhighlight %}

**5.6**  
The export directive takes a variable and makes it accessible to sub-make commands.  
In this example, "cooly" is exported such that the makefile in subdir can use it.  
  
Recursively call a makefile. Use the special $(MAKE) instead of "make"  
because it will pass the make flags for you and won't itself be affected by them.  
  
Note: export has the same syntax as sh, but it they aren't related (although similar in function)  
{% highlight make %}
new_contents = "\
hello:\\n\
\\techo \$$(cooly)"

all:
	mkdir -p subdir
	echo $(new_contents) | sed -e 's/^ //' > subdir/makefile
	@echo "---MAKEFILE CONTENTS---"
	@cd subdir && cat makefile
	@echo "---END mAKEFILE CONTENTS---"
	cd subdir && $(MAKE)

# Note that variables and exports. They are set/affected globally.
cooly = "The subdirectory can see me!"
export cooly
# This would nullify the line above: unexport cooly

clean:
	rm -rf subdir


{% endhighlight %}

**5.6**  
You need to export variables to have them run in the shell as well.  
{% highlight make %}

one=this will only work locally
export two=we can run subcommands with this

.PHONY: all
all: 
	@echo $(one)
	@echo $$one
	@echo $(two)
	@echo $$two
{% endhighlight %}

**5.6**  
`EXPORT_ALL_VARIABLES` does what you might expect  
{% highlight make %}

.EXPORT_ALL_VARIABLES:
new_contents = "\
hello:\\n\
\\techo \$$(cooly)"

cooly = "The subdirectory can see me!"
# This would nullify the line above: unexport cooly

all:
	mkdir -p subdir
	echo $(new_contents) | sed -e 's/^ //' > subdir/makefile
	@echo "---MAKEFILE CONTENTS---"
	@cd subdir && cat makefile
	@echo "---END mAKEFILE CONTENTS---"
	cd subdir && $(MAKE)

clean:
	rm -rf subdir

{% endhighlight %}

**5.7**  
You can make a list of commands like so:  
{% highlight make %}

define sweet
echo "hello"
echo "target:" $@
echo "prereqs:" $<
endef

.PHONY: all
all: one
	$(sweet)
	# Append @ here to append @ to all the commands in sweet: @$(sweet)

one:
	touch one

clean:
	rm -f one

{% endhighlight %}

**6.1**  
Reference variables using ${} or $()
{% highlight make %}

x = dude

.PHONY: all
all:
	echo $(x)
	echo ${x}

	# Bad practice, but works
	echo $x 


{% endhighlight %}

**6.2**  
Two flavors of variables:  
recursive - only looks for the variables when the command is *used*, not when it's *defined*.  
simply expanded - like normal imperative programming -- only those defined so far get expanded
{% highlight make %}

# This will print "later" at the end
one = one ${later_variable}
# This will not
two := two ${later_variable}

later_variable = later

.PHONY: all
all: 
	echo $(one)
	echo $(two)
{% endhighlight %}

**6.2**  
Simply expanded allows you to append to a variable. Recursive definitions will give an infinite loop error.  
{% highlight make %}

one = hello
one := ${one} there

.PHONY: all
all: 
	echo $(one)
{% endhighlight %}

**6.2**  
?= only sets variables if they have not yet been set
{% highlight make %}

one = hello
one ?= will not be set
two ?= will be set

.PHONY: all
all: 
	echo $(one)
	echo $(two)
{% endhighlight %}

**6.2**  
Spaces at the end of a line are not stripped, ones at the start are  
To make a variable with a single space, have a variable guard
{% highlight make %}

with_spaces = hello   # end of line
after = $(with_spaces)there

nullstring =
space = $(nullstring) # end of line

.PHONY: all
all: 
	echo "$(after)"
	echo start"$(space)"end
{% endhighlight %}

**6.3**  
You can text replace at the end of each space seperated word using $(var:a=b)  
Note: don't put spaces in between anything; it will be seen as a search or replacement term  
Note: This is shorthand for using the "patsubst" expansion function
{% highlight make %}

foo := a.o b.o c.o
bar := $(foo:.o=.c)

.PHONY: all
all: 
	echo $(bar)
{% endhighlight %}

**6.3**  
You can use % as well to grab some text!
{% highlight make %}

foo := a.o b.o c.o
bar := $(foo:%.o=%)

.PHONY: all
all: 
	echo $(bar)
{% endhighlight %}

**6.5**  
An undefined variable is actually an empty string :o
{% highlight make %}

.PHONY: all
all: 
	echo $(nowhere)
{% endhighlight %}

**6.6**  
Use += to append
{% highlight make %}

foo := start
foo += more

.PHONY: all
all: 
	echo $(foo)
{% endhighlight %}

**6.7**  
You can override variables that come from the command line by using "override".
Here we ran make with `make some_option=hi`
{% highlight make %}

override some_option += additional
.PHONY: all
all: 
	echo $(some_option)
{% endhighlight %}

**6.8**  
"define" is actually just a multiline variable defintion. It has nothing with being a function.  
Note here that it's a bit different than having a semi-colon between commands, because each is run
in a seperate shell, as expected.
{% highlight make %}

one = export blah="I was set!"; echo $$blah

define two
export blah=set
echo $$blah
endef

.PHONY: all
all: 
	@echo "This prints I was set:"
	@$(one)
	@echo "This does not:"
	@$(two)
{% endhighlight %}

**6.10**  
Variables can be assigned for specific targets
{% highlight make %}

all: one = cool

.PHONY: all
all: 
	echo one is defined: $(one)

.PHONY: other
other:
	echo one is nothing: $(one)
{% endhighlight %}

**6.11**  
You can assign variables for specific target *patterns*
{% highlight make %}

%.c: one = cool

blah.c: 
	echo one is defined: $(one)

.PHONY: other
other:
	echo one is nothing: $(one)
{% endhighlight %}

**7.1**  
Conditional/If statements
{% highlight make %}

foo = ok

all:
ifeq ($(foo), ok)
	echo "foo equals ok"
else
	echo "nope"
endif
{% endhighlight %}

**7.2**  
Check if variable is empty
{% highlight make %}

nullstring =
foo = $(nullstring) # end of line; there is a space here

all:
ifeq ($(strip $(foo)),)
	echo "foo is empty"
endif
ifeq ($(foo),)
	echo "foo doesn't even have spaces?"
endif
{% endhighlight %}

**7.2**  
ifdef does not expand variable references; it just sees if something is defined at all
{% highlight make %}

bar =
foo = $(bar)

all:
ifdef foo
	echo "foo is defined"
endif
ifdef bar
	echo "but bar is not"
endif

{% endhighlight %}

**7.3**  
Search for a MAKEFLAG
{% highlight make %}

bar =
foo = $(bar)

all:
# Search for the "-i" flag. MAKEFLAGS is just a list of single characters, one per flag. So look for "i" in this case.
ifneq (,$(findstring i, $(MAKEFLAGS)))
	echo "i was passed to MAKEFLAGS"
endif
{% endhighlight %}

**8.1**  
Call functions with $(fn, arguments) or $(fn, arguments)  
{% highlight make %}

bar := $(subst not, totally, "I am not superman")
bar2 := $(subst not, totally, "I am not superman")
.PHONY: all
all: 
	@echo $(bar)
	@echo $(bar2)

{% endhighlight %}

**8.1**  
If you want to replace spaces or commas, use variables
{% highlight make %}
comma := ,
empty:=
space := $(empty) $(empty)
foo := a b c
bar := $(subst $(space),$(comma),$(foo))

.PHONY: all
all: 
	@echo $(bar)
{% endhighlight %}

**8.1**  
Do NOT include spaces in the arguments after the first. That will be seen as part of the string.
{% highlight make %}
comma := ,
empty:=
space := $(empty) $(empty)
foo := a b c
bar := $(subst $(space), $(comma) , $(foo))

.PHONY: all
all: 
	# Output is ", a , b , c". Notice the spaces introduced
	@echo $(bar)

8.2, 8.3, 8.9 TODO do something about the fns  
TODO 8.7 origin fn? Better in documentation?
{% endhighlight %}

**8.4**  
foreach takes:  
$(foreach var,list,text) and sets var to each word in list, and outputs outputs that into a "list" of words in text. By list I mean a space seperated sentence of words.  
This appends an exclamation after each word
{% highlight make %}
foo := who are you
bar := $(foreach wrd,$(foo),$(wrd)!)

.PHONY: all
all: 
	@echo $(bar)
{% endhighlight %}

**8.5**  
If: (in a function instead of normal.. call this the functional style)  
Checks if the first argument is nonempty. If so runs the second argument, otherwise runs the third.
{% highlight make %}
foo := $(if this-is-not-empty,then!,else!)
empty :=
bar := $(if $(empty),then!,else!)

.PHONY: all
all: 
	@echo $(foo)
	@echo $(bar)
{% endhighlight %}

**8.6**  
Call: $(call variable,param,param)  
Sets each of the params as $(1), $(2), etc.  
$(0) is set as the variable name
{% highlight make %}

sweet_new_fn = Variable Name: $(0)$ First: $(1) Second: $(2) Empty Variable: $(3)

.PHONY: all
all: 
	@echo $(call sweet_new_fn, go, tigers)
{% endhighlight %}

**8.8**  
shell - This calls the shell, but it removes newlines!
{% highlight make %}
.PHONY: all
all: 
	@echo $(shell ls -la) # Very ugly because the newlines are gone!
{% endhighlight %}

**9**  

* There's a nice [list of commands](http://www.gnu.org/software/make/manual/make.html#Options-Summary) that can be run from make. Check out `--dry-run, --touch, --old-file`. 
* You can have multiple targets to make, i.e. `make clean run test` runs the 'clean' goal, then 'run', and then 'test'.
