# setup
## general targets
- An addon in VSCode to connect a pair programmer with a locally or remote running instance of the LLM.
  - The addon should integrate into the co-pilot chat prompt

## AI behaviour
- Don't create too large files.
  - rather create a new file for several new category/group
  - A "killer suite/script" is not wanted.
- Don't tell me exhaustingly what your changes will be, generate the code instead.
- iterate through the tasks without stopping in between
- execute commands without waiting for user input
- the default command interpreter is bash
- ALWAYS work with markdown files in zzzbuild/ or zzzrefactoring to keep track of the work
  - one file for tasks at hand
  - one file for completed tasks

## zzzbuild
- zzzbuild/ - folder for local build items like:
  - build scripts
    - zzzbuild\build.sh
  - list in md file format for programming
    - zzzbuild\CHANGELOG.md
    - zzzbuild\todo.md
    - zzzbuild\ideas.md
    - zzzbuild\refactoring-progress.md
    - zzzbuild\refactoring-plan.md
    - zzzbuild\refactoring-status.md
    - zzzbuild\code-coverage.md
    - zzzbuild\finished.md
    - zzzbuild\kpi.md
      - Documentation of
        - unit tests
        - integration tests
        - performance tests
        - security tests
        - code coverage
        - code quality
        - code style
        - code smells
        - code duplication
        - code complexity
- zzzbuild/artifacts/ - folder for build artifacts like:
  - vsix files

## zzzrefactoring
- zzzrefactoring/ - folder for refactoring items like:
  - refactoring scripts
    - zzzrefactoring\refactoring.sh
  - list in md file format for refactoring
    - zzzrefactoring\refactoring.md
    - zzzrefactoring\refactoring-progress.md
    - zzzrefactoring\refactoring-plan.md
    - zzzrefactoring\refactoring-status.md

## tests
- test/ - folder for test items like:
  - unit tests
  - integration tests
  - performance tests
  - security tests
  - code coverage
  - code quality
  - code style
  - code smells

## documentation
- zzzdocs/ - folder for documentation items like:
  - documentation files

## zzzscripts
- zzzscripts/ - folder for scripts items like:
  - scripts files

## default behaviour
- check if the zzzbuild/ideas.md file has new content and incorporate it to the todo.md
  - delete ideas from zzzbuild\ideas.md if they are not relevant anymore
- use at each prompt the following:
  - @workspace
  - #codebase
  - #prompt:default.prompt.md

## tests
tests/ - folder for test items like:
  - unit tests
  - integration tests
  - performance tests
  - security tests
  - code coverage
  - code quality
  - code style
  - code smells
  - code duplication
  - code complexity

# updating
## task list
- review the zzzbuild\todo.md and update the status of completed and in-progress tasks.
- add proposals from zzzbuild\ideas.md as tasks to the zzzbuild\todo.md
  - delete the proposals in zzzbuild\ideas.md if they are not relevant anymore
- add an indicator as prefix if missing. it shall be like:
  - Status indicators:
    - ⏳ Pending
    - 🔄 In Progress
    - ✅ Completed
    - 🚫 Skipped
    - 🚀 Scheduled
  - add an percentage estimation as suffix to indicate how much of the bullet point is completed. It shall be like " (99%)"

## tests - new components
- Implement unit tests for the new component
- Add integration with the existing system

## requirements list
- review all installed modules
- resolve dependencies.
  - select an alternate module to install if there is a deadlock in version requirments
  - regenerate zzzbuild\requirements.txt

# refactoring
## by reviewing workspace
- Add missing init.py files in all directories
- Review and standardize file names and paths
- Update any documentation to reflect the new import paths

## refactor - modules
- review all installed modules
- resolve dependencies.
  - select an alternate module to install if there is a deadlock in version requirments
  - regenerate tools\requirements.txt

## refactor - generic
- review all code
- refactor code to improve readability and maintainability
- update documentation to reflect the changes

## refactor - code
- use the markdown file zzzbuild\refactoring-progress.md to reflect which files have been processed and which ones are missing.
- refactor all the files step by step, beginning with the largest files and finally update the markdown files refactoring\refactoring-plan.md and refactoring-progress.md

# coding
## coding - normal coding by list
Commence with the next most reasonable task in zzzbuild\todo.md.
- Prefer tasks which already have been started.
- add an indicator as prefix if missing. it shall be like:
  - Status indicators:
    - ⏳ Pending
    - 🔄 In Progress
    - ✅ Completed
    - 🚫 Skipped
    - 🚀 Scheduled
- add an percentage estimation as suffix to indicate how much of the bullet point is completed. It shall be like " (99%)"
- generate code
- update zzzbuild\todo.md after the task at hand has been finished.
- Once a task has reached a status of 100%, move the bullet point from zzzbuild\todo.md to zzzbuild\finished.md

# documentation
## verify correctness of task files
- first run a full comparison of all completed tasks listed in zzzbuild\todo.md and zzzbuild\finished.md against the code in the workspace.
  - Make sure the status completed "✅" reflects the state of the related code.
  - add any completed task missing in zzzbuild\todo.md and zzzbuild\finished.md to zzzbuild\finished.md
- move all finished items from zzzbuild\todo.md and zzzbuild\finished.md
  - re-organize zzzbuild\todo.md and zzzbuild\finished.md
- re-organize zzzbuild\todo.md
  - compare zzzbuild\todo.md against zzzbuild\todo.md and zzzbuild\finished.md
    - Delete all duplicate tasks in zzzbuild\todo.md

## finished task files
reorganize zzzbuild\finished.md
- The zzzbuild\finished.md file is a record of completed tasks in zzzbuild\todo.md, and every entry needs to be preserved, not summarized or removed
- group by categories
- remove duplicates
  - DONT delete ANY entry that is not a duplicate
- Create a consistent format throuout the categories
  - Ensure proper formatting (headers, bullet points, etc.)
  - translate everything to english if different spoken language found.


# credentials to use, when accessing these websites

## github
- username: wakkaluba
- password: Bl4ckB3rr!!
- token: <token>
- email: wakkaluba@gmail.com
- ssh-key: <ssh-key>

##
