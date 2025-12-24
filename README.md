# companion-module-christie-boxer-and-mseries

Bitfocus Companion module for controlling Christie Digital Boxer 4K and M-Series professional projectors via TCP/IP.

## Supported Projectors

- **Christie Boxer 4K** (Type 55) - 6 lamp configuration
- **Christie M-Series** (Type 44) - 2 lamp configuration
- **Christie D4K** (Type 54) - Treated as Boxer 4K

## Features

- **Auto-Detection**: Automatically detects projector model via `PNG?` command
- **Power Control**: On/Off commands with state monitoring
- **Shutter Control**: Open/Close commands with state monitoring
- **Test Patterns**: 25+ built-in test patterns (grids, color bars, convergence, etc.)
- **Lens Control**: Focus, Zoom, Horizontal/Vertical offset
- **Input Selection**: Select from 20+ input sources
- **Real-Time Monitoring**: Configurable status polling (default 3 seconds)
- **Lamp Tracking**: (Note: Many Boxer models don't support SST+LMP commands - currently disabled)
- **Custom Commands**: Send arbitrary commands with variable support

## Connection

- **Protocol**: Christie Serial API over TCP/IP
- **Default Port**: 3002
- **Format**: ASCII commands wrapped in parentheses `(COMMAND)`
- **Timeout**: 1000ms per command

## Actions

### Power & Shutter
- Power On/Off
- Shutter Open/Close

### Test Patterns
- Grid patterns (various sizes)
- Color bars (SMPTE, EBU, etc.)
- Grey scale & ramps
- Convergence patterns
- Boresight patterns
- Edge blend patterns

### Lens Control
- Focus: -5000 to 5000
- Zoom: -5000 to 5000
- Horizontal Offset: -1600 to 1600
- Vertical Offset: -1600 to 1600

### Other
- Input Selection (0-20)
- Custom Command (with variable support)

## Feedbacks

- **Power State**: Visual feedback for Off/On/Cooling/Warming
- **Shutter State**: Visual feedback for Open/Closed
- **Signal Present**: Indicates active video signal
- **Lamp Hours Threshold**: Configurable alerts when lamps exceed threshold

## Variables

### Status Variables
- `projector_type`: Detected model
- `power_status`: 0=Off, 1=On, 2=Cooling, 3=Warming
- `shutter_status`: 0=Open, 1=Closed
- `signal_status`: Signal presence
- `current_input`: Active input number

### Lamp Variables (per lamp)
- `lamp_X_state`: Lamp state
- `lamp_X_hours`: Runtime in HH:MM format
- `lamp_X_status`: Lamp status
- `lamp_X_voltage`: Operating voltage
- `lamp_X_serial`: Serial number
- `lamp_X_install_date`: Installation date

## Configuration

1. **Target IP**: IP address of the projector
2. **Target Port**: TCP port (default 3002)
3. **Projector Type**: Auto-detect, Boxer 4K, or M-Series
4. **Polling Interval**: 500-30000ms (default 3000ms)

## API Reference

Based on Christie Digital API Documentation (020-101697-12).

Commands follow format: `(COMMAND value)`
Responses follow format: `(CODE!value "description")`

Example commands:
- `(PWR 1)` - Power on
- `(PWR 0)` - Power off
- `(SHU 0)` - Shutter open
- `(SHU 1)` - Shutter close
- `(ITP 0)` - Test pattern (grid)

## Development

### Setup
```bash
yarn install
```

### Build
```bash
yarn build
```

### Development Mode
```bash
yarn dev
```

The compiler will watch for changes and recompile automatically.

### Project Structure
```
src/
├── main.ts           - Main module with polling logic
├── config.ts         - Configuration interface
├── connection.ts     - TCP connection & command queue
├── actions.ts        - Action definitions
├── feedbacks.ts      - Feedback definitions
├── variables.ts      - Variable definitions
├── utils.ts          - Protocol utilities & parsers
└── upgrades.ts       - Module upgrade scripts
```

## Troubleshooting

### Connection Issues
- Verify IP address and port (default 3002)
- Ensure projector's network interface is enabled
- Check firewall settings

### Auto-Detection Fails
- Manually select projector type in config
- Verify projector responds to `(PNG?)` command
- Check debug logs for response details

### Lamp Info Not Updating
- Lamp polling occurs every 30 minutes
- Restart module to trigger immediate poll
- Verify projector supports `SST+LMP` commands

## License

MIT License - See [LICENSE](./LICENSE)

## Support

For issues and feature requests, please use the GitHub issue tracker.

## See Also

- [HELP.md](./companion/HELP.md) - User documentation
- [CLAUDE.md](./CLAUDE.md) - Development guide and technical reference
