# Christie Boxer 4K and M-Series Projector Module

A comprehensive Bitfocus Companion module for controlling Christie Digital Boxer 4K and M-Series projectors via TCP/IP.

## Overview

This module provides complete control and monitoring of Christie Digital professional projectors through their serial API protocol over TCP/IP. It supports automatic projector detection, real-time status monitoring, and comprehensive lamp tracking.

## Supported Models

- **Christie Boxer 4K** (Type 55)
  - 6 lamps: A1, A2, A3, B1, B2, B3
  - Full lens control support

- **Christie M-Series** (Type 44)
  - 2 lamps
  - Full lens control support

- **Christie D4K** (Type 54)
  - Treated as Boxer 4K (uses same command set)

## Features

### Auto-Detection
- Automatically detects projector type using the `PNG?` command
- Falls back to manual selection if auto-detection fails
- Updates status and variables based on detected type

### Real-Time Monitoring
- **Status Polling**: Configurable interval (default 3 seconds)
  - Power status (Off, On, Cooling, Warming)
  - Shutter status (Open, Closed)
  - Signal presence

- **Lamp Polling**: Every 30 minutes
  - Individual lamp hours tracking
  - Lamp state and status
  - Serial numbers and install dates
  - Voltage monitoring (Boxer only)

### Command Queue System
- Sequential command/response handling
- 1000ms timeout per command
- Automatic retry logic
- Prevents command overlap

## Configuration

### Connection Settings
- **Target IP**: IP address of the projector
- **Target Port**: Default 3002 (Christie serial protocol over Ethernet)
- **Projector Type**: Auto-detect, Boxer 4K, or M-Series
- **Polling Interval**: 500-30000ms (default 3000ms)

## Actions

### Power Control
- **Power On**: `PWR 1`
- **Power Off**: `PWR 0`

### Shutter Control
- **Shutter Open**: `SHU 0`
- **Shutter Close**: `SHU 1`

### Test Patterns
- **Test Pattern**: `ITP <index>`
  - 25+ built-in test patterns including:
    - Grid, Checker, Color Bars
    - Grey scales and ramps
    - Convergence and boresight patterns
    - Edge blend patterns
    - And more...

### Lens Control
- **Lens Focus**: `FCS <position>` (-5000 to 5000)
- **Lens Zoom**: `ZOM <position>` (-5000 to 5000)
- **Horizontal Offset**: `LHO <position>` (-1600 to 1600)
- **Vertical Offset**: `LVO <position>` (-1600 to 1600)

### Input Selection
- **Select Input**: `SIN <input>` (0-20)

### Custom Commands
- **Custom Command**: Send any arbitrary command
  - Supports Companion variables
  - Useful for advanced control

## Feedbacks

### Power State Feedbacks
- **Power State**: Match specific power state (Off/On/Cooling/Warming)
  - Default: Green background when on
- **Power Is On**: Simple on/off indicator
  - Default: Green background
- **Power Is Off**: Simple on/off indicator
  - Default: Dark grey background

### Shutter State Feedbacks
- **Shutter State**: Match specific shutter state (Open/Closed)
  - Default: Orange background
- **Shutter Is Open**: Simple open/closed indicator
  - Default: Green background
- **Shutter Is Closed**: Simple open/closed indicator
  - Default: Red background

### Signal Feedback
- **Signal Present**: Indicates active video signal
  - Default: Green background

### Lamp Monitoring
- **Lamp Hours Threshold**: Alert when lamp exceeds threshold
  - Configurable per lamp (1-6)
  - Default threshold: 1000 hours
  - Default: Red background when exceeded

## Variables

### General Status
- `projector_type`: Detected projector model
- `power_status`: Current power state (0=Off, 1=On, 2=Cooling, 3=Warming)
- `shutter_status`: Current shutter state (0=Open, 1=Closed)
- `signal_status`: Signal presence indicator
- `current_input`: Active input number

### Lamp Information
For each lamp (1-6 for Boxer, 1-2 for M-Series):
- `lamp_X_state`: Lamp state
- `lamp_X_hours`: Runtime in HH:MM format
- `lamp_X_status`: Lamp status
- `lamp_X_voltage`: Operating voltage (Boxer only)
- `lamp_X_serial`: Serial number
- `lamp_X_install_date`: Installation date (Boxer only)

**Note**: Lamps 3-6 show "N/A" for M-Series projectors

## Technical Details

### Protocol Specification
- **Connection**: TCP/IP on port 3002
- **Command Format**: `(COMMAND)` or `(COMMAND value)`
- **Response Format**: `(CODE!value "description")`
- **Timeout**: 1000ms per command
- **Termination**: No line termination character

### Command Examples
```
Power On:     (PWR 1)      -> (PWR!001 000 "1" "On")
Power Query:  (PWR?)       -> (PWR!001 000 "1" "On")
Shutter Open: (SHU 0)      -> (SHU!000 000 "0" "Open")
Lamp Query:   (SST+LMP!000?) -> (SST+LMP!000 000 "1" "On")
```

### Auto-Detection Logic
1. Send `(PNG?)` command
2. Parse response to extract type code
3. Map type code to projector model:
   - 044 = M-Series
   - 055 = Boxer 4K
   - 054 = D4K (treated as Boxer)

### Response Parsing
The module handles multiple response formats:
- Simple value: `(CMD!value)`
- Value with description: `(CMD!value "description")`
- Full format: `(CMD!subcode errorcode "value" "description")`

Special handling:
- Escaped characters are removed: `\\(h:m\\)` becomes clean text
- Hours format normalized: `"314:41 \\(h:m\\)"` becomes `"314:41"`

## File Structure

```
src/
├── main.ts           - Main module class with polling logic
├── config.ts         - Configuration interface and fields
├── connection.ts     - TCP connection and command queue manager
├── actions.ts        - Action definitions
├── feedbacks.ts      - Feedback definitions
├── variables.ts      - Variable definitions
├── utils.ts          - Protocol utilities and parsers
└── upgrades.ts       - Module upgrade scripts
```

## Development Notes

### Adding New Actions
1. Add action definition in `actions.ts`
2. Use `self.connection.sendCommand(command)` for async execution
3. Add error handling with try/catch
4. Log success and errors appropriately

### Adding New Feedbacks
1. Add feedback definition in `feedbacks.ts`
2. Use `self.getVariableValue(variableId)` to read state
3. Define default style (colors)
4. Return boolean for activation state

### Adding New Variables
1. Add variable definition in `variables.ts`
2. Set initial value to 'Unknown' or 'N/A'
3. Update value in polling functions (`pollStatus` or `pollLampInfo`)
4. Call `self.checkFeedbacks()` after updates if needed

### Testing
- Use the Custom Command action to test new commands
- Monitor debug logs for protocol-level details
- Verify response parsing with known projector responses

## Troubleshooting

### Connection Issues
- Verify IP address and port (default 3002)
- Check network connectivity to projector
- Ensure projector's network interface is enabled

### Auto-Detection Fails
- Manually select projector type in configuration
- Check debug logs for response details
- Verify projector responds to `(PNG?)` command

### Polling Errors
- Check timeout value (default 1000ms may need adjustment)
- Reduce polling interval if network is slow
- Monitor logs for specific command failures

### Lamp Information Not Updating
- Ensure lamp polling is active (every 30 minutes)
- Manually trigger poll by restarting module
- Check projector supports `SST+LMP` commands

## API Reference

Based on Christie Digital API documentation (020-101697-12).

### Key Commands
- `PWR <0|1>` - Power control
- `SHU <0|1>` - Shutter control
- `ITP <index>` - Internal test pattern
- `FCS <position>` - Lens focus
- `ZOM <position>` - Lens zoom
- `LHO <position>` - Lens horizontal offset
- `LVO <position>` - Lens vertical offset
- `SIN <input>` - Select input
- `PNG?` - Query projector type
- `SST+LMP!<code>?` - Query lamp information
- `SST+SIGN!000?` - Query signal status

## License

This module is part of the Bitfocus Companion ecosystem.

## Support

For issues and feature requests, please use the module's GitHub repository issue tracker.
