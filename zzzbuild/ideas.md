# keep track of the entire conversation history in a project
  - store the history in a file
  - use the history as reference if replying to a message. Most annoying is, when an edit has happened, you get a question and you reply to it. Most times the agent does not recall the previous message or objective given to the agent.
    - a main file should keep track of project objectives
    - add to each message a "forget" button to remove the message from the history
    - add a "chapter" button to add a new history file when starting a new chapter
  - use the history to generate new ideas
  - use the history to generate new code
  - use the history to generate new documentation
  - use the history to generate new tests

# error handling for html output
copilot seem to have memory issues after a while.
  - if possible add a button to clear the memory of copilot "changed" file list not only remove the file entries.
  - if possible add a button to restart copilot.

# access to 3rd party extensions and VSCode API
  - make the extensions available and accessible to PPA copilot to use them.
  - enable PPA copilot to alter configurations in VSCode and extensions
  - enable PPA copilot installation of extensions if needed or useful/meaningful
  - enable PPA copilot to use VSCode API

# 'Continue?' question handler
  The copilot keeps asking to continue after a certain amount of time/iterations/etc.pp, which forces the users attention to the chat window all the time. Just in case a command has to be executed, a confirmation to continue iteration is needed or the like.
  - I want a toggle switch to disable the continue queries to the user.
  
# yes/no button in the reply in copilot
  Often I want to reply to the copilot with a yes or no. It would be nice to have a yes/no button in the reply window.