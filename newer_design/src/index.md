---
title: Makefile Tutorial
draft: false
collection: Get Started
layout: layout.ejs
date: 2016-12-24
autotoc: true
---

<b>I built this guide because I could never quite wrap my head around understanding Makefiles.</b> They seemed awash with hidden rules and esoteric symbols, and asking simple questions didn’t yield simple answers. To solve this, I sat down for several weekends and read everything I could about Makefiles. I’ve congregated the most critical knowledge into this guide, where I help you learn Make through a series of descriptive, self contained examples that you can run yourself.

If you mostly understand Make, consider checking out the Makefile Cookbook, which has a template for medium sizes projects with ample comments about what each part of the Makefile is doing.

Good luck, and I hope you are able to slay the confusing world of Makefiles!

# Getting Started
Makefiles are used to help decide which parts of a large program need to be recompiled. Typically C or C++ files are compiled, but any language that can be compiled with shell commands will work. It can be used beyond programs too, when you need a series of instructions to run depending on what files have changed.

## Running the Examples


To run these examples, you'll need a terminal and "make" installed. For each example, put the contents in a file called `Makefile`, and in that directory run the command `make`. Let's start with the simplest of Makefiles:
```makefile
hello:
	echo "hello world"
```

Here is the output of running the above example:
```shell
$ make
echo "hello world"
hello world
```

That's it! If you're a bit confused, here's a video that goes through these steps, along with describing the basic structure of Makefiles.

<div class='yt-video'>
<iframe width="560" height="315" src="https://www.youtube.com/embed/8QxYAUcq5FU" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</div>

## Makefile Syntax

A Makefile consists of a set of *rules*. A rule generally looks like this:
```makefile
targets: prerequisities
   command
   command
   command
```

- The *targets* are file names, seperated by spaces. Typically, there is only one per rule.
- The *commands* are a series of steps typically used to make the target(s). These *need to start with a tab character*, not spaces.
- The *prerequisites* are also file names, seperated by spaces. These files need to exist before the commands for the target are run. These are also called *dependencies*

## Beginner Examples
The following Makefile has three seperate *rules*. When you run `make blah` in the terminal, it will build a program called `blah` in a series of steps:
- Make is given `blah` as the target, so it first searches for this target
- `blah` requires `blah.o`, so make searches for the `blah.o` target
- `blah.o` requires `blah.c`, so make searches for the `blah.c` target
- `blah.c` has no dependencies, so the `echo` command is run
- The `cc -c` command is then run, because all of the `blah.o` dependencies are finished
- The top `cc` command is run, because all the `blah` dependencies are finished
- That's it: `blah` is a compiled c program

```makefile
blah: blah.o
	cc blah.o -o blah # Runs third

blah.o: blah.c
	cc -c blah.c -o blah.o # Runs second

blah.c:
	echo "int main() { return 0; }" > blah.c # Runs first
```

This makefile has a single target, called `some_file`. The default target is the first target, so in this case `some_file` will run.
```makefile
some_file:
	echo "This line will always print"
```

This file will make `some_file` the first time, and the second time notice it's already made, resulting in `make: 'some_file' is up to date.`
```makefile
some_file:
	echo "This line will only print once"
	touch some_file
```

Here, the target `some_file` "depends" on `other_file`. When we run `make`, the default target (`some_file`, since it's first) will get called. It will first look at its list of *dependencies*, and if any of them are older, it will first run the targets for those dependencies, and then run itself. The second time this is run, neither target will run because both targets exist.
```makefile
some_file: other_file
	echo "This will run second, because it depends on other_file"
	touch some_file

other_file:
	echo "This will run first"
	touch other_file
```

This will always run both targets, because `some_file` depends on other_file, which is never created.
```makefile
some_file: other_file
	touch some_file

other_file:
	echo "nothing"
```

`clean` is often used as a target that removes the output of other targets, but it is not a special work in `make`.
```makefile
some_file: 
	touch some_file

clean:
	rm -f some_file
```


## Variables
Variables can only be strings. Here's an example of using them:
```makefile
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
```

Call variables using ${} or $()
```makefile

x = dude

all:
	echo $(x)
	echo ${x}

	# Bad practice, but works
	echo $x 
```

# Targets
## The all target
<!--  (Section 4.4) -->
Making multiple targets and you want all of them to run? Make a `all` target.
```makefile
all: one two three

one:
	touch one
two:
	touch two
three:
	touch three

clean:
	rm -f one two three

```

## Multiple targets
<!--  (Section 4.8) -->
When there are multiple targets for a rule, the commands will be run for each target  
`$@` is a *automatic variable* that contains the target name.
```makefile

all: f1.o f2.o

f1.o f2.o:
	echo $@
# Equivalent to:
# f1.o
# 	echo $@
# f2.o
# 	echo $@

```

## Multiple targets via wildcards
<!--  (Section 4.8) -->
We can use the wildcard % in targets, that captures zero or more of any character. Note we do not use *.o, because that is just the string *.o, which might be useful in the commands,  
but is only one target and does not expand.  
<!--
TODO why was this not a problem when I didn't use the % wildcard?
-->
```makefile

all: f1.o f2.o

%.o:
	echo $@

```

# Automatic Variables and Wildcards
## Wildcard
<!--  (Section 4.2) -->
We can use wildcards in the target, prerequisites, or commands.  
Valid wildcards are `*, ?, [...]`  
```makefile
some_file: *.c
	# create the binary

*.c:
	touch f1.c
	touch f2.c
 
clean:
	rm -f *.c

```

<!--  (Section 4.2.3) -->
We CANNOT use wildcards in other places, like variable declarations or function arguments  
Use the wildcard function instead.  
```makefile
wrong = *.o # Wrong
objects := $(wildcard *.c) # Right
some_binary: 
	touch f1.c
	touch f2.c
	echo $(wrong)
	echo $(objects)

clean:
	rm -f *.c


```

## Automatic Variables
<!--  (Section 10.5) -->
There are many [automatic variables](https://www.gnu.org/software/make/manual/html_node/Automatic-Variables.html), but often only a few show up:
```makefile
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

```

# Fancy Rules
## Static Pattern Rules
<!--  (Section 4.10) -->
Make loves c compilation. And every time it expresses its love, things get confusing. Here's the syntax for a new type of rule called a static pattern:
```makefile
targets ...: target-pattern: prereq-patterns ...
   commands
```

The essence is that the a given target is matched by the target-pattern (via a `%` wildcard). Whatever was matched is called the *stem*. The stem is then substituted into the prereq-pattern, to generate the target's prereqs.

A typical use case is to compile `.c` files into `.o` files. Here's the *manual way*:
```makefile
all: foo.o bar.o

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
```

Here's the more *efficient way*, using a static pattern rule:
```makefile
# This Makefile uses less hard coded rules, via static pattern rules
objects = foo.o bar.o
all: $(objects)

# Syntax - targets ...: target-pattern: prereq-patterns ...
# In the case of the first target, foo.o, the target-pattern matches foo.o and sets the "stem" to be "foo".
#   It then replaces that stem with the wilecard pattern in prereq-patterns
$(objects): %.o: %.c
	echo "Call gcc to generate $@ from $<"

%.c:
	touch $@

clean:
	rm -f foo.c bar.c

```

## Static Pattern Rules and Filter
<!--  (Section 4.10) -->
`filter` can be used in Static pattern rules to match the correct files. In this example, I made up the `.raw` and `.result` extensions.
```makefile

obj_files = foo.result bar.o lose.o
src_files = foo.raw bar.c lose.c

all: $(obj_files)

$(filter %.o,$(obj_files)): %.o: %.c
	echo "target: $@ prereq: $<"
$(filter %.result,$(obj_files)): %.result: %.raw
	echo "target: $@ prereq: $<" 

%.c %.raw:
	touch $@

clean:
	rm -f $(src_files)
```

## Double-Colon Rules
<!--  (Section 4.11) -->
Double-Colon Rules are rarely used, but allow the same target to run commands from multiple targets. If these were single colons, an warning would be printed and only the second set of commands would run.
```makefile
all: blah

blah::
	echo "hello"

blah::
	echo "hello again"

clean:
	rm -f $(src_files)

```

## Implicit Rules
<!--  (Section 10) -->
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


```makefile
CC = gcc # Flag for implicit rules
CFLAGS = -g # Flag for implicit rules. Turn on debug info

# Implicit rule #1: blah is built via the C linker implicit rule
# Implicit rule #2:  blah.o is built via the C++ compilation implicit rule, because blah.cpp exists
blah: blah.o

blah.c:
	echo "int main() { return 0; }" > blah.c

clean:
	rm -f blah*
```





# Commands and execution
## Command Echoing/Silencing
<!--  (Section 5.1) -->
Add an `@` before a command to stop it from being printed  
You can also run make with `-s` to add an `@` before each line  
```makefile
all: 
	@echo "This make line will not be printed"
	echo "But this will"
```

## Command Execution
<!--  (Section 5.2) -->
Each command is run in a new shell (or at least the affect is as such)
```makefile
all: 
	cd ..
	# The cd above does not affect this line, because each command is effectively run in a new shell
	echo `pwd`

	# This cd command affects the next because they are on the same line
	cd ..;echo `pwd`

	# Same as above
	cd ..; \
	echo `pwd`

```

## Default Shell
<!--  (Section 5.2) -->
The default shell is `/bin/sh`. You can change this by changing the variable SHELL:
```makefile
SHELL=/bin/bash

cool:
	echo "Hello from bash"
```

## Error handling with `-k`, `-i`, and `i`
<!--  (Section 5.4) -->
Add `-k` when running make to continue running even in the face of errors. Helpful if you want to see all the errors of Make at once.  
Add a `-` before a command to suppress the error  
Add `-i` to make to have this happen for every command.

<!--  (Section 5.4) -->
```makefile
one:
	# This error will be printed but ignored, and make will continue to run
	-false
	touch one

```

## Interrupting or killing make
<!--  (Section 5.5) -->
Note only: If you `ctrl+c` make, it will delete the newer targets it just made.

## Recursive use of make
<!--  (Section 5.6) -->
To recursively call a makefile, use the special `$(MAKE)` instead of `make` because it will pass the make flags for you and won't itself be affected by them.
```makefile
new_contents = "hello:\n\ttouch inside_file"
all:
	mkdir -p subdir
	echo $(new_contents) | sed -e 's/^ //' > subdir/makefile
	cd subdir && $(MAKE)

clean:
	rm -rf subdir

```

## Use export for recursive make
<!--  (Section 5.6) -->
The export directive takes a variable and makes it accessible to sub-make commands. In this example, `cooly` is exported such that the makefile in subdir can use it.  
  
Note: export has the same syntax as sh, but they aren't related (although similar in function)  
```makefile
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
```

<!--  (Section 5.6) -->
You need to export variables to have them run in the shell as well.  
```makefile

one=this will only work locally
export two=we can run subcommands with this

all: 
	@echo $(one)
	@echo $$one
	@echo $(two)
	@echo $$two
```

<!--  (Section 5.6) -->
`.EXPORT_ALL_VARIABLES` exports all variables for you.
```makefile
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
```

## Arguments to make
<!--  (Section 9) -->

There's a nice [list of options](http://www.gnu.org/software/make/manual/make.html#Options-Summary) that can be run from make. Check out `--dry-run`, `--touch`, `--old-file`. 

You can have multiple targets to make, i.e. `make clean run test` runs the `clean` goal, then `run`, and then `test`.

# Variables Pt. 2
## Flavors and modification
<!-- (6.1, 6.2, 6.3) -->
There are two flavors of variables:  
- recursive (use `=`) - only looks for the variables when the command is *used*, not when it's *defined*.  
- simply expanded (use `:=`) - like normal imperative programming -- only those defined so far get expanded

```makefile

# Recursive variable. This will print "later" below
one = one ${later_variable}
# Simply expanded variable. This will not print "later" below
two := two ${later_variable}

later_variable = later

all: 
	echo $(one)
	echo $(two)
```

Simply expanded (using `:=`) allows you to append to a variable. Recursive definitions will give an infinite loop error.  
```makefile

one = hello
# one gets defined as a simply expanded variable (:=) and thus can handle appending
one := ${one} there

all: 
	echo $(one)
```

?= only sets variables if they have not yet been set
```makefile

one = hello
one ?= will not be set
two ?= will be set

all: 
	echo $(one)
	echo $(two)
```

Spaces at the end of a line are not stripped, but those at the start are. To make a variable with a single space, use `$(nullstring)`
```makefile
with_spaces = hello   # with_spaces has many spaces after "hello"
after = $(with_spaces)there

nullstring =
space = $(nullstring) # Make a variable with a single space.

all: 
	echo "$(after)"
	echo start"$(space)"end
```

Use the form $(var:a=b) to replace text in a series of space-seperated words.

Note: don't put spaces in between anything; it will be seen as a search or replacement term  
Note: This is shorthand for using make's `patsubst` expansion function
```makefile
foo := a.o b.o c.o
# bar becomes a.c b.c c.c
bar := $(foo:.o=.c)

all: 
	echo $(bar)
```

You can use % as well to grab some text!
```makefile

foo := a.o b.o c.o
bar := $(foo:%.o=%)

all: 
	echo $(bar)
```

An undefined variable is actually an empty string!
```makefile

all: 
	# Undefined variables are just empty strings!
	echo $(nowhere)
```

Use += to append
```makefile
foo := start
foo += more

all: 
	echo $(foo)
```

## Command line arguments and override
<!--  (Section 6.7) -->
You can override variables that come from the command line by using `override`.
Here we ran make with `make some_option=hi`
```makefile
# Overrides command line arguments
override option_one = did_override
# Does not override command line arguments
option_two = not_override
all: 
	echo $(option_one)
	echo $(option_two)
```

## List of commands and define
<!--  (Section 6.8) -->
"define" is actually just a list of commands. It has nothing with being a function.  
Note here that it's a bit different than having a semi-colon between commands, because each is run
in a seperate shell, as expected.
```makefile

one = export blah="I was set!"; echo $$blah

define two
export blah=set
echo $$blah
endef

# One and two are different.

all: 
	@echo "This prints 'I was set'"
	@$(one)
	@echo "This does not print 'I was set' because each command runs in a seperate shell"
	@$(two)
```

## Target-specific variables
<!--  (Section 6.10) -->
Variables can be assigned for specific targets
```makefile

all: one = cool

all: 
	echo one is defined: $(one)

other:
	echo one is nothing: $(one)
```

## Pattern-specific variables
<!--  (Section 6.11) -->
You can assign variables for specific target *patterns*
```makefile

%.c: one = cool

blah.c: 
	echo one is defined: $(one)

other:
	echo one is nothing: $(one)
```

# Conditional part of Makefiles
## Conditional if/else
<!--  (Section 7.1) -->
```makefile

foo = ok

all:
ifeq ($(foo), ok)
	echo "foo equals ok"
else
	echo "nope"
endif
```

## Check if a variable is empty
<!--  (Section 7.2) -->
```makefile
nullstring =
foo = $(nullstring) # end of line; there is a space here

all:
ifeq ($(strip $(foo)),)
	echo "foo is empty after being stripped"
endif
ifeq ($(nullstring),)
	echo "nullstring doesn't even have spaces"
endif
```

## Check if a variable is defined
<!--  (Section 7.2) -->
ifdef does not expand variable references; it just sees if something is defined at all
```makefile

bar =
foo = $(bar)

all:
ifdef foo
	echo "foo is defined"
endif
ifdef bar
	echo "but bar is not"
endif

```

## $(makeflags)
<!-- `(Section 7.3) -->
This example shows you how to test make flags with `findstring` and `MAKEFLAGS`. Run this example with `make -i` to see it print out the echo statement.
```makefile

bar =
foo = $(bar)

all:
# Search for the "-i" flag. MAKEFLAGS is just a list of single characters, one per flag. So look for "i" in this case.
ifneq (,$(findstring i, $(MAKEFLAGS)))
	echo "i was passed to MAKEFLAGS"
endif
```

# Functions
## First Functions
<!--  (Section 8.1) -->
*Functions* are mainly just for text processing. Call functions with `$(fn, arguments)` or `${fn, arguments}`. You can make your own using the [call](https://www.gnu.org/software/make/manual/html_node/Call-Function.html#Call-Function) builtin function. Make has a decent amount of [builtin functions](https://www.gnu.org/software/make/manual/html_node/Functions.html).
```makefile
bar := ${subst not, totally, "I am not superman"}
all: 
	@echo $(bar)

```

If you want to replace spaces or commas, use variables
```makefile
comma := ,
empty:=
space := $(empty) $(empty)
foo := a b c
bar := $(subst $(space),$(comma),$(foo))

all: 
	@echo $(bar)
```

Do NOT include spaces in the arguments after the first. That will be seen as part of the string.
```makefile
comma := ,
empty:=
space := $(empty) $(empty)
foo := a b c
bar := $(subst $(space), $(comma) , $(foo))

all: 
	# Output is ", a , b , c". Notice the spaces introduced
	@echo $(bar)

```

<!-- # 8.2, 8.3, 8.9 TODO do something about the fns   
# TODO 8.7 origin fn? Better in documentation?
-->

## The foreach function
<!--  (Section 8.4) -->
The foreach function looks like this: `$(foreach var,list,text)`. It converts one list of words (seperated by speces) to another. `var` is set to each word in list, and `text` is expanded for each word.  
This appends an exclamation after each word:
```makefile
foo := who are you
# For each "word" in foo, output that same word with an exclamation after
bar := $(foreach wrd,$(foo),$(wrd)!)

all:
	# Output is "who! are! you!"
	@echo $(bar)
```

## The if function
<!--  (Section 8.5) -->
`if` checks if the first argument is nonempty. If so runs the second argument, otherwise runs the third.
```makefile
foo := $(if this-is-not-empty,then!,else!)
empty :=
bar := $(if $(empty),then!,else!)

all:
	@echo $(foo)
	@echo $(bar)
```

## The call function
<!--  (Section 8.6) -->
`Call`: $(call variable,param,param)  
Sets each of the params as $(1), $(2), etc.  
$(0) is set as the variable name
```makefile
sweet_new_fn = Variable Name: $(0) First: $(1) Second: $(2) Empty Variable: $(3)

all:
	# Outputs "Variable Name: sweet_new_fn First: go Second: tigers Empty Variable:"
	@echo $(call sweet_new_fn, go, tigers)
```

## The shell function
<!--  (Section 8.8) -->
shell - This calls the shell, but it replaces newlines with spaces!
```makefile
all: 
	@echo $(shell ls -la) # Very ugly because the newlines are gone!
```

# Other Features
## The vpath Directive
<!--  (Section 4.3.2) -->
Use vpath to specify where some set of prerequisites exist. The format is `vpath <pattern> <directories, space/colon seperated>`  
`<pattern>` can have a `%`, which matches any zero or more characters.  
You can also do this globallyish with the variable VPATH  
```makefile

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

```
## Multiline
The backslash ("\\") character gives us the ability to use multiple lines when the commands are too long
```makefile
some_file: 
	echo This line is too long, so \
		it is broken up into multiple lines
```

## .phony
Adding `.PHONY` to a target will prevent make from confusing the phony target with a file name. In this example, if the file `clean` is created, make clean will still be run. `.PHONY` is great to use, but I'll skip it in the rest of the examples for simplicity.
```makefile
some_file:
	touch some_file
	touch clean
 
.PHONY: clean
clean:
	rm -f some_file
	rm -f clean
```

## .delete_on_error
<!-- (Section 5.4) -->

The make tool will stop running a rule (and will propogate back to prerequisites) if a command returns a nonzero exit status.  
`DELETE_ON_ERROR` will delete the target of a rule if the rule fails in this manner. This will happen for all targets, not just the one it is before like PHONY. It's a good idea to always use this, even though make does not for historical reasons.  

```makefile
.DELETE_ON_ERROR:
all: one two

one:
	touch one
	false

two:
	touch two
	false
```

# Makefile Cookbook
Now that you understand `make`, let's look a template you can use for your own projects.

<!-- Partly from https://www.partow.net/programming/makefile/index.html -->
The file structure used in this example is as follows:
```
─┬[ Project Folder ]
 ├──● Makefile (Shown below)
 ├──┬[ include ]
 │  └──● program.hpp
 └──┬[ src ]
    ├──┬[ module1 ]
    │  ├──● mod1.cpp
    ├──● program1.cpp
    └──● program2.cpp
```

This makefile will automatically build all the C++ files, link them together, and generate a single executable located at `build/apps/program`:
```makefile
CXX      := g++
CXXFLAGS := -Wall -Wuninitialized -std=c++17 -g
LDFLAGS  := -L/usr/lib -Llib
BUILD    := ./build
OBJ_DIR  := $(BUILD)/objects
INCLUDE  := -Iinclude/
SRC      :=                      \
   $(wildcard src/*.cpp)         \
   $(wildcard src/module1/*.cpp) \

OBJECTS  := $(SRC:%.cpp=$(OBJ_DIR)/%.o)

all: mkdirs $(BUILD)/program

$(OBJ_DIR)/%.o: %.cpp
	$(CXX) $(CXXFLAGS) $(INCLUDE) -c $< -o $@

$(BUILD)/program: $(OBJECTS)
	$(CXX) $(CXXFLAGS) -o $(APP_DIR)/$(TARGET) $^ $(LDFLAGS)

.PHONY: all mkdirs clean

mkdirs:
	mkdir -p $(OBJ_DIR)

clean:
	rm -rvf $(BUILD)/*
```




<!--
TODO: This example fails initially because blah.d doesn't exist. I'm not sure how to fix this example, there are probably better ones out there..

# Generating Prerequisites Automatically (Section 4.12)
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
```makefile
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
```
-->
