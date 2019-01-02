# Node Finite State Machine
You can find the package in: https://www.npmjs.com/package/node-finite-state-machine

-- OR --
using the following command to install:
```bash
npm i node-finite-state-machine
```

# History

library for finite state machines. This project has been modified from [Javascript State Machine](https://github.com/jakesgordon/javascript-state-machine) with the following changes:

1. Remove all the front-end code.
1. Rewrite camelize to use cached regex.
1. Restructure file locations
1. Rewrite FSM, Config in to classes.
1. Add persistence plugin.
1. History plugin support persistence.
1. Add support to ENUM
1. Add History and Persistence as "builtin" plugins.
1. Add reset() and setState() functions (required by persistence plugin).
1. Add "change" event for plugins.
1. Add createTime and updateTime properties
1. History plugin support timestamps.
