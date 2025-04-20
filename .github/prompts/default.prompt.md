# setup
@workspace
#codebase 

# updating
## task list
- review the todo.md and update the status of completed and in-progress tasks.
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
- do not stop and run a resume on the steps done, just enter them into refactoring-progress.md.

# coding
## coding - normal coding by list
Commence with the next most reasonable task in todo.md.
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
- update todo.md after the task at hand has been finished.
- Once a task has reached a status of 100%, move the bullet point from zzzbuild\todo.md to zzzbuild\finished.md

# documentation
## verify correctness of task files
- first run a full comparison of all completed tasks listed in zzzbuild\todo.md and zzzbuild\finished.md against the code in the workspace.
  - Make sure the status completed "[X]" reflects the state of the related code.
  - add any completed task missing in todo.md and zzzbuild\finished.md to zzzbuild\finished.md
- move all finished items from zzzbuild\todo.md and zzzbuild\finished.md
  - re-organize todo.md and zzzbuild\finished.md
- re-organize todo.md
  - compare todo.md against todo.md and zzzbuild\finished.md
    - Delete all duplicate tasks in todo.md
- re-organize todo.md

## finished task files
reorganize zzzbuild\finished.md
- The zzzbuild\finished.md file is a record of completed tasks, and every entry needs to be preserved, not summarized or removed
- group the categories
- remove duplicates
  - DONT delete ANY entry that is not a duplicate
- Create a consistent format for each category
  - Ensure proper formatting (headers, bullet points, etc.)
  - translate everything to english if different spoken language found.

