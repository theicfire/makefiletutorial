---
layout: default
title: Makefile Tutorial by Example
---

<span class='intro'>This tutorial is based on the topics covered in the [GNU Make](https://www.cl.cam.ac.uk/teaching/0910/UnixTools/make.pdf) book. This tutorial teaches mainly through examples in order to help quickly explain the concepts in the book.</span>

<!--
# Vocab
- Target, goal, dependency

**Getting started video**  
<iframe width="560" height="315" src="https://www.youtube.com/embed/8QxYAUcq5FU" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
-->

**Makefile Syntax**  
A Makefile consists of a set of *rules*. A rule generally looks like this:
{% highlight txt %}
targets : prerequisities
   command
   command
   command
{% endhighlight %}

- The *targets* are file names, seperated by spaces. Typically, there is only one per rule.
- The *commands* are a series of steps typically used to make the target(s). These *need to start with a tab character*, not spaces.
- The *prerequisites* are also file names, seperated by spaces. These files need to exist before the commands for the target are run.

**Make Overview**  
The main use of Make is to list out a set of directions to compile some c or c++ files, although it can solve other similar problems. The user gives Make some *goal*, say "generate the file hello". The Makefile specifies how to make this file. Here's an example:
{% highlight make %}
# Since the blah target is first, it is the default target and will be run when we run "make"
blah: blah.o
	cc blah.o -o blah

blah.o: blah.c
	cc -c blah.c -o blah.o

blah.c:
	echo "int main() { return 0; }" > blah.c

clean:
	rm -f blah.o blah.c blah
{% endhighlight %}

**Running the Examples**  
I made a quick [video](/screencasts.html) to show how to run these examples. You'll need a terminal and "make" installed. For each example, put the contents in a file called `Makefile`, and in that directory run the command `make`. Here is the output of running the above example:
```
$ make
echo "int main() { return 0; }" > blah.c
cc -c blah.c -o blah.o
cc blah.o -o blah
```

Some examples, like the above, have a target called "clean". Run it via `make clean` to delete the files that `make` generated:
```
$ make clean
rm -f blah.o blah.c blah
```

**Simple Examples**  
This makefile has a single target, called `some_file`. The default target is the first target, so in this case `some_file` will run.
{% highlight make %}
some_file:
	echo "This line will always print"
{% endhighlight %}

This file will make `some_file` the first time, and the second time notice it's already made, resulting in `make: 'some_file' is up to date.`
{% highlight make %}
some_file:
	echo "This line will only print once"
	touch some_file
{% endhighlight %}

Alternative syntax: same line
{% highlight make %}
some_file: ; touch some_file
{% endhighlight %}

The backslash ("\\") character gives us the ability to use multiple lines when the commands are too long
{% highlight make %}
some_file: 
	echo This line is too long, so \
		it is broken up into multiple lines
{% endhighlight %}

Here, the target `some_file` "depends" on `other_file`. When we run `make`, the default target (`some_file`, since it's first) will get called. It will first look at its list of *dependencies*, and if any of them are older, it will first run the targets for those dependencies, and then run itself. The second time this is run, neither target will run because both targets exist.
{% highlight make %}
some_file: other_file
	echo "This will run second, because it depends on other_file"
	touch some_file

other_file:
	echo "This will run first"
	touch other_file
{% endhighlight %}

This will always make both targets, because `some_file` depends on other_file, which is never created.
{% highlight make %}
some_file: other_file
	touch some_file

other_file:
	echo "nothing"
{% endhighlight %}

"clean" is often used as a target that removes the output of other targets.
{% highlight make %}
some_file: clean
	touch some_file

clean:
	rm -f some_file
{% endhighlight %}

Adding `.PHONY` to a target will prevent make from confusing the phony target with a file name. In this example, if the file "clean" is created, make clean will still be run. `.PHONY` is great to use, but I'll skip it in the rest of the examples for simplicity.
{% highlight make %}
some_file:
	touch some_file
	touch clean
 
.PHONY: clean
clean:
	rm -f some_file
	rm -f clean
{% endhighlight %}

**Variables (Section 2.4)**  
Variables can only be strings. Here's an example of using them:
{% highlight make %}
files = file1 file2
some_file: $(files)
	echo "Look at this variable: " $(files)
	touch some_file

file1:
	touch file1
file2:
	touch file2
 
clean:
	rm -f file1 file2 some_file
{% endhighlight %}

**Magic Implicit Commands (Section 2.5)**  
Probably one of the most confusing parts about Make is the hidden coupling between Make and GCC. Make was largely made for GCC, and so makes compiling C/C++ programs "easy".

{% highlight make %}
# Implicit command of: "cc blah.o -o blah"
# Note: Do not put a comment inside of the blah.o rule; the implicit rule will not run!
blah:

# Implicit command of: "cc -c blah.c -o blah.o"
blah.o:

blah.c:
	echo "int main() { return 0; }" > blah.c

clean:
	rm -f blah.o blah blah.c
{% endhighlight %}

**Using Wildcard Characters (Section 4.2)**  
We can use wildcards in the target, prerequisites, or commands.  
Valid wildcards are `*, ?, [...]`  
{% highlight make %}
some_file: *.c
	# create the binary

*.c:
	touch f1.c
	touch f2.c
 
clean:
	rm -f *.c

{% endhighlight %}

**The Wildcard Function (Section 4.2.3)**  
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
	rm -f *.c


{% endhighlight %}

**The vpath Directive (Section 4.3.2)**  
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
	rm -f some_binary

{% endhighlight %}

**The all target (Section 4.4)**  
Making multiple targets and you want all of them to run? Make a `all` target and designate it as `.PHONY`
{% highlight make %}
all: one two three
.PHONY: all

one:
	touch one
two:
	touch two
three:
	touch three

clean:
	rm -f one two three

{% endhighlight %}

**Multiple targets (Section 4.8)**  
When there are multiple targets for a rule, the commands will be run for each target  
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

{% endhighlight %}

**Multiple targets via wildcards (Section 4.8)**  
We can use the wildcard % in targets, that captures zero or more of any character. Note we do not use *.o, because that is just the string *.o, which might be useful in the commands,  
but is only one target and does not expand.  
<!--
TODO why was this not a problem when I didn't use the % wildcard?
-->
{% highlight make %}

all: f1.o f2.o
.PHONY: all

%.o:
	echo $@

{% endhighlight %}

**Static Pattern Rules (Section 4.10)**  
Make loves c compilation. And every time it expresses its love, things get confusing. Here's the syntax for a new type of rule called a static pattern:
{% highlight make %}
targets ...: target-pattern: prereq-patterns ...
   commands
{% endhighlight %}

The essence is that the a given target is matched by the target-pattern (via a `%` wildcard). Whatever was matched is called the *stem*. The stem is then substituted into the prereq-pattern, to generate the target's prereqs.

A typical use case is to compile `.c` files into `.o` files. Here's the *manual way*:
{% highlight make %}
all: foo.o bar.o
.PHONY: all

# The automatic variable $@ matches the target, and $< matches the prerequisite
foo.o: foo.c
	echo "Call gcc to generate $@ from $<"

bar.o: bar.c
	echo "Call gcc to generate bar.o from bar.c"

# Matches all .c files and creates them if they don't exist
%.c:
	touch $@

clean:
	rm -f foo.c bar.c
{% endhighlight %}

Here's the more *efficient way*, using a static pattern rule:
{% highlight make %}
# This Makefile uses less hard coded rules, via static pattern rules
objects = foo.o bar.o
all: $(objects)
.PHONY: all

# Syntax - targets ...: target-pattern: prereq-patterns ...
# In the case of the first target, foo.o, the target-pattern matches foo.o and sets the "stem" to be "foo".
#   It then replaces that stem with the wilecard pattern in prereq-patterns
$(objects): %.o: %.c
	echo "Call gcc to generate $@ from $<"

%.c:
	touch $@

clean:
	rm -f foo.c bar.c

{% endhighlight %}

**Static Pattern Rules and Filter (Section 4.10)**  
`filter` can be used in Static pattern rules to match the correct files  
{% highlight make %}

obj_files = foo.elc bar.o lose.o
src_files = foo.el bar.c lose.c

all: $(obj_files)

$(filter %.o,$(obj_files)): %.o: %.c
	echo "target: " $@ "prereq: " $<
$(filter %.elc,$(obj_files)): %.elc: %.el
	echo "target: " $@ "prereq: " $<

%.c %.el:
	touch %@

clean:
	rm -f $(src_files)
{% endhighlight %}

**Double-Colon Rules (Section 4.11)**  
Double-Colon Rules are rarely used, but allow the same target to run commands from multiple targets.  
If these were single colons, an warning would be printed and only the second set of commands would run.
{% highlight make %}
all: blah

blah::
	echo "hello"

blah::
	echo "hello again"

clean:
	rm -f $(src_files)

{% endhighlight %}

<!--
TODO: This example fails initially because blah.d doesn't exist. I'm not sure how to fix this example, there are probably better ones out there..

**Generating Prerequisites Automatically (Section 4.12)**  
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
# Run make init first, then run make
# This outputs
all: blah.d

clean:
	rm -f blah.d blah.c blah.h blah.o blah

%.d: %.c
	rm -f $@; \
	 $(CC) -MM $(CPPFLAGS) $< > $@.$$$$; \
	 sed 's,\($*\)\.o[ :]*,\1.o $@ : ,g' < $@.$$$$ > $@; \
	 rm -f $@.$$$$

init:
	echo "#include \"blah.h\"; int main() { return 0; }" > blah.c
	touch blah.h

sources = blah.c

include $(sources:.c=.d)
{% endhighlight %}
-->

**Command Echoing/Silencing (Section 5.1)**  
Add an @ before a command to stop it from being printed  
You can also run make with -s to add an @ before each line  
{% highlight make %}
all: 
	@echo "This make line will not be printed"
	echo "But this will"
{% endhighlight %}

**Command Execution (Section 5.2)**  
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

**Default Shell (Section 5.2)**  
The default shell is `/bin/sh`. You can change this by changing the variable SHELL:
{% highlight make %}
SHELL=/bin/bash

cool:
	echo "Hello from bash"
{% endhighlight %}

**DELETE_ON_ERROR (Section 5.4)**  
The make tool will stop running a rule (and will propogate back to prerequisites) if a command returns a nonzero exit status.  
`DELETE_ON_ERROR` will delete the target of a rule if the rule fails in this manner. This will happen for all targets, not just the one it is before like PHONY. It's a good idea to always use this, even though make does not for historical reasons.  

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

**Error handling with `-k`, `-i`, and `i` (Section 5.4)**  
Add `-k` when running make to continue running even in the face of errors. Helpful if you want to see all the errors of Make at once.  
Add a "-" before a command to suppress the error  
Add "-i" to make to have this happen for every command.

**Handling errors with `-` and `-i` (Section 5.4)**  
{% highlight make %}
one:
	# This error will be printed but ignored, and make will continue to run
	-false
	touch one

{% endhighlight %}

**Interrupting or killing make (Section 5.5)**  
Note only: If you ctrl+c make, it will delete the newer targets it just made.

**Recursive use of make (Section 5.6)**  
Recursively call a makefile. Use the special $(MAKE) instead of "make"  
because it will pass the make flags for you and won't itself be affected by them.
{% highlight make %}
new_contents = "hello:\n\ttouch inside_file"
all:
	mkdir -p subdir
	echo $(new_contents) | sed -e 's/^ //' > subdir/makefile
	cd subdir && $(MAKE)

clean:
	rm -rf subdir

{% endhighlight %}

**Use `export` for recursive make (Section 5.6)**  
The export directive takes a variable and makes it accessible to sub-make commands.  
In this example, "cooly" is exported such that the makefile in subdir can use it.  
  
Note: export has the same syntax as sh, but they aren't related (although similar in function)  
{% highlight make %}
new_contents = "hello:\n\\techo \$$(cooly)"

all:
	mkdir -p subdir
	echo $(new_contents) | sed -e 's/^ //' > subdir/makefile
	@echo "---MAKEFILE CONTENTS---"
	@cd subdir && cat makefile
	@echo "---END MAKEFILE CONTENTS---"
	cd subdir && $(MAKE)

# Note that variables and exports. They are set/affected globally.
cooly = "The subdirectory can see me!"
export cooly
# This would nullify the line above: unexport cooly

clean:
	rm -rf subdir
{% endhighlight %}

**Another export example (Section 5.6)**  
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

**`EXPORT_ALL_VARIABLES` (Section 5.6)**  
`EXPORT_ALL_VARIABLES` does what you might expect  
{% highlight make %}
.EXPORT_ALL_VARIABLES:
new_contents = "hello:\n\techo \$$(cooly)"

cooly = "The subdirectory can see me!"
# This would nullify the line above: unexport cooly

all:
	mkdir -p subdir
	echo $(new_contents) | sed -e 's/^ //' > subdir/makefile
	@echo "---MAKEFILE CONTENTS---"
	@cd subdir && cat makefile
	@echo "---END MAKEFILE CONTENTS---"
	cd subdir && $(MAKE)

clean:
	rm -rf subdir
{% endhighlight %}

**Variables (Section 6.1)**  
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

**Variables (Section 6.2)**  
Two flavors of variables:  
- recursive (use `=`) - only looks for the variables when the command is *used*, not when it's *defined*.  
- simply expanded (use `:=`) - like normal imperative programming -- only those defined so far get expanded
{% highlight make %}

# Recursive variable. This will print "later" below
one = one ${later_variable}
# Simply expanded variable. This will not print "later" below
two := two ${later_variable}

later_variable = later

.PHONY: all
all: 
	echo $(one)
	echo $(two)
{% endhighlight %}

**Variables (Section 6.2)**  
Simply expanded allows you to append to a variable. Recursive definitions will give an infinite loop error.  
{% highlight make %}

one = hello
# one gets defined as a simply expanded variable (:=) and thus can handle appending
one := ${one} there

.PHONY: all
all: 
	echo $(one)
{% endhighlight %}

**Variables and `?=` (Section 6.2)**  
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

**Variables: watch out for end-of-line spaces (Section 6.2)**  
Spaces at the end of a line are not stripped, ones at the start are  
To make a variable with a single space, have a variable guard
{% highlight make %}
with_spaces = hello   # with_spaces has many spaces after "hello"
after = $(with_spaces)there

nullstring =
space = $(nullstring) # Make a variable with a single space.

.PHONY: all
all: 
	echo "$(after)"
	echo start"$(space)"end
{% endhighlight %}

**Variables: Text replacement (Section 6.3)**  
You can text replace at the end of each space seperated word using $(var:a=b)  
Note: don't put spaces in between anything; it will be seen as a search or replacement term  
Note: This is shorthand for using make's `patsubst` expansion function
{% highlight make %}
foo := a.o b.o c.o
# bar becomes a.c b.c c.c
bar := $(foo:.o=.c)

.PHONY: all
all: 
	echo $(bar)
{% endhighlight %}

**Variables: Text replacement (Section 6.3)**  
You can use % as well to grab some text!
{% highlight make %}

foo := a.o b.o c.o
bar := $(foo:%.o=%)

.PHONY: all
all: 
	echo $(bar)
{% endhighlight %}

**Undefined Variables (Section 6.5)**  
An undefined variable is actually an empty string!
{% highlight make %}

.PHONY: all
all: 
	# Undefined variables are just empty strings!
	echo $(nowhere)
{% endhighlight %}

**Variable appending (Section 6.6)**  
Use += to append
{% highlight make %}
foo := start
foo += more

.PHONY: all
all: 
	echo $(foo)
{% endhighlight %}

**Command line arguments and `override` (Section 6.7)**  
You can override variables that come from the command line by using "override".
Here we ran make with `make some_option=hi`
{% highlight make %}
# Overrides command line arguments
override option_one = did_override
# Does not override command line arguments
option_two = not_override
.PHONY: all
all: 
	echo $(option_one)
	echo $(option_two)
{% endhighlight %}

**List of commands and `define` (Section 6.8)**  
"define" is actually just a list of commands. It has nothing with being a function.  
Note here that it's a bit different than having a semi-colon between commands, because each is run
in a seperate shell, as expected.
{% highlight make %}

one = export blah="I was set!"; echo $$blah

define two
export blah=set
echo $$blah
endef

# One and two are different.

.PHONY: all
all: 
	@echo "This prints 'I was set'"
	@$(one)
	@echo "This does not print 'I was set' because each command runs in a seperate shell"
	@$(two)
{% endhighlight %}

**Target-specific variables (Section 6.10)**  
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

**Pattern-specific variables (Section 6.11)**  
You can assign variables for specific target *patterns*
{% highlight make %}

%.c: one = cool

blah.c: 
	echo one is defined: $(one)

.PHONY: other
other:
	echo one is nothing: $(one)
{% endhighlight %}

**Conditional if/else (Section 7.1)**  
{% highlight make %}

foo = ok

all:
ifeq ($(foo), ok)
	echo "foo equals ok"
else
	echo "nope"
endif
{% endhighlight %}

**Check if a variable is empty (Section 7.2)**  
{% highlight make %}
nullstring =
foo = $(nullstring) # end of line; there is a space here

all:
ifeq ($(strip $(foo)),)
	echo "foo is empty after being stripped"
endif
ifeq ($(nullstring),)
	echo "nullstring doesn't even have spaces"
endif
{% endhighlight %}

**`ifdef` (Section 7.2)**  
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

**Testing make flags with `findstring` and `MAKEFLAG`(Section 7.3)**  
Run this example with `make -i` to see it print out the echo statement.
{% highlight make %}

bar =
foo = $(bar)

all:
# Search for the "-i" flag. MAKEFLAGS is just a list of single characters, one per flag. So look for "i" in this case.
ifneq (,$(findstring i, $(MAKEFLAGS)))
	echo "i was passed to MAKEFLAGS"
endif
{% endhighlight %}

**Functions (Section 8.1)**  
*Functions* are mainly just for text processing. Call functions with `$(fn, arguments)` or `${fn, arguments}`. You can make your own using the [call](https://www.gnu.org/software/make/manual/html_node/Call-Function.html#Call-Function) builtin function. Make has a decent amount of [builtin functions](https://www.gnu.org/software/make/manual/html_node/Functions.html).
{% highlight make %}
bar := ${subst not, totally, "I am not superman"}
all: 
	@echo $(bar)

{% endhighlight %}

**Functions (Section 8.1)**  
If you want to replace spaces or commas, use variables
{% highlight make %}
comma := ,
empty:=
space := $(empty) $(empty)
foo := a b c
bar := $(subst $(space),$(comma),$(foo))

all: 
	@echo $(bar)
{% endhighlight %}

**Functions (Section 8.1)**  
Do NOT include spaces in the arguments after the first. That will be seen as part of the string.
{% highlight make %}
comma := ,
empty:=
space := $(empty) $(empty)
foo := a b c
bar := $(subst $(space), $(comma) , $(foo))

all: 
	# Output is ", a , b , c". Notice the spaces introduced
	@echo $(bar)

{% endhighlight %}

<!-- # 8.2, 8.3, 8.9 TODO do something about the fns   
# TODO 8.7 origin fn? Better in documentation?
-->

**The foreach function (Section 8.4)**  
The foreach function looks like this: `$(foreach var,list,text)`. It converts one list of words (seperated by speces) to another. `var` is set to each word in list, and `text` is expanded for each word.  
This appends an exclamation after each word:
{% highlight make %}
foo := who are you
# For each "word" in foo, output that same word with an exclamation after
bar := $(foreach wrd,$(foo),$(wrd)!)

all:
	# Output is "who! are! you!"
	@echo $(bar)
{% endhighlight %}

**The if function (Section 8.5)**  
`if` checks if the first argument is nonempty. If so runs the second argument, otherwise runs the third.
{% highlight make %}
foo := $(if this-is-not-empty,then!,else!)
empty :=
bar := $(if $(empty),then!,else!)

all:
	@echo $(foo)
	@echo $(bar)
{% endhighlight %}

**The call function (Section 8.6)**  
`Call`: $(call variable,param,param)  
Sets each of the params as $(1), $(2), etc.  
$(0) is set as the variable name
{% highlight make %}
sweet_new_fn = Variable Name: $(0) First: $(1) Second: $(2) Empty Variable: $(3)

all:
	# Outputs "Variable Name: sweet_new_fn First: go Second: tigers Empty Variable:"
	@echo $(call sweet_new_fn, go, tigers)
{% endhighlight %}

**The shell function (Section 8.8)**  
shell - This calls the shell, but it replaces newlines with spaces!
{% highlight make %}
all: 
	@echo $(shell ls -la) # Very ugly because the newlines are gone!
{% endhighlight %}

**Arguments to make (Section 9)**  

There's a nice [list of options](http://www.gnu.org/software/make/manual/make.html#Options-Summary) that can be run from make. Check out `--dry-run`, `--touch`, `--old-file`. 

You can have multiple targets to make, i.e. `make clean run test` runs the 'clean' goal, then 'run', and then 'test'.

**Implicit Rules (Section 10)**  
Perhaps the most confusing part of make is the magic rules and variables that are made. Here's a list of implicit rules:
- Compiling a C program: `n.o` is made automatically from `n.c` with a command of the form `$(CC) -c $(CPPFLAGS) $(CFLAGS)`
- Compiling a C++ program: `n.o` is made automatically from `n.cc` or `n.cpp` with a command of the form `$(CXX) -c $(CPPFLAGS) $(CXXFLAGS)`
- Linking a single object file: `n` is made automatically from `n.o` by running the command `$(CC) $(LDFLAGS) n.o $(LOADLIBES) $(LDLIBS)`

As such, the important variables used by implicit rules are:
- `CC`: Program for compiling C programs; default cc
- `CXX`: Program for compiling C++ programs; default G++
- `CFLAGS`: Extra flags to give to the C compiler
- `CXXFLAGS`: Extra flags to give to the C++ compiler
- `CPPFLAGS`: Extra flags to give to the C preprosessor
- `LDFLAGS`: Extra flags to give to compilers when they are supposed to invoke the linker


{% highlight make %}
CC = gcc # Flag for implicit rules
CFLAGS = -g # Flag for implicit rules. Turn on debug info

# Implicit rule #1: blah is built via the C linker implicit rule
# Implicit rule #2:  blah.o is built via the C++ compilation implicit rule, because blah.cpp exists
blah: blah.o

blah.c:
	echo "int main() { return 0; }" > blah.c

clean:
	rm -f blah*
{% endhighlight %}

**Automatic Variables (Section 10.5)**  
There are many [automatic variables](https://www.gnu.org/software/make/manual/html_node/Automatic-Variables.html), but often only a few show up:
{% highlight make %}
hey: one two
	# Outputs "hey", since this is the first target
	echo $@

	# Outputs all prerequisites older than the target
	echo $?

	# Outputs all prerequisites
	echo $^

	touch hey

one:
	touch one

two:
	touch two

clean:
	rm -f hey one two

{% endhighlight %}
