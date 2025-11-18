---
title: Engine Overview
category: engine
---

# The Engine
This is the main driver of the game, responsible for processing input, updating the current screen state, and calling the render solution's draw call.

## Systems
_The following systems are part of the core system functionally and can be accessed in each tick_
- Render: Responds to entity apperances and events to reflect game state
- Logger: The log system, both for system logging and logging game events
- Events: System for subscribing to and emitting events
- Input: Input manager, system through which input handlers receive events

### Render
A canvas render solution has been provided to provide graphics on the HTML Canvas element using the rudimentary 2D canvas API. 

### Logger
Intended to be used for adding logging to functionality as well as for providing a logging system to log in game actions

### Events
Basic pub/sub system

### Input
System for managing user inputs and translating them to events in game