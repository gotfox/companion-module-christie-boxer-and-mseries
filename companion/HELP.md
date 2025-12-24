# Christie Boxer 4K and M-Series Projector Control

This module provides comprehensive control of Christie Digital Boxer 4K and M-Series professional projectors via TCP/IP.

## Supported Models

- Christie Boxer 4K (6 lamps)
- Christie M-Series (2 lamps)
- Christie D4K (treated as Boxer 4K)

## Configuration

### Connection Settings

1. **Target IP**: Enter the IP address of your Christie projector
2. **Target Port**: Default is 3002 (Christie serial protocol over Ethernet)
3. **Projector Type**:
   - **Auto-detect** (recommended): Module will automatically detect your projector
   - **Boxer 4K**: Manually select for Boxer 4K projectors
   - **M-Series**: Manually select for M-Series projectors
4. **Polling Interval**: How often to update status (default 3000ms / 3 seconds)

### Network Setup

Ensure your Christie projector's network interface is configured and accessible from the Companion host. The default port for Christie serial protocol over TCP/IP is **3002**.

## Available Actions

### Power Control
- **Power On**: Turn the projector on
- **Power Off**: Turn the projector off

### Shutter Control
- **Shutter Open**: Open the shutter (display image)
- **Shutter Close**: Close the shutter (blank screen)

### Test Patterns
Display built-in test patterns including:
- Grid patterns (various sizes)
- Color bars (SMPTE, EBU, Full, Split)
- Grey scale patterns
- Ramp patterns (horizontal/vertical)
- Convergence patterns
- Boresight patterns
- Edge blend patterns
- And many more...

### Lens Control
Fine-tune lens position:
- **Lens Focus**: Adjust focus (-5000 to 5000)
- **Lens Zoom**: Adjust zoom (-5000 to 5000)
- **Horizontal Offset**: Move lens horizontally (-1600 to 1600)
- **Vertical Offset**: Move lens vertically (-1600 to 1600)

### Input Selection
- **Select Input**: Choose from inputs 0-20

### Custom Commands
- **Custom Command**: Send any Christie API command
  - Supports Companion variables
  - Use for advanced control not covered by standard actions

## Available Feedbacks

### Power Feedbacks
- **Power State**: Match specific state (Off/On/Cooling/Warming)
- **Power Is On**: Simple on indicator
- **Power Is Off**: Simple off indicator

### Shutter Feedbacks
- **Shutter State**: Match specific state (Open/Closed)
- **Shutter Is Open**: Simple open indicator
- **Shutter Is Closed**: Simple closed indicator

### Signal Feedback
- **Signal Present**: Indicates when video signal is detected

### Lamp Monitoring
- **Lamp Hours Threshold**: Alert when any lamp exceeds specified hours
  - Configurable threshold (default 1000 hours)
  - Works for all lamps (1-6 for Boxer, 1-2 for M-Series)

## Available Variables

### Status Variables
- `$(INSTANCENAME:projector_type)`: Detected projector model
- `$(INSTANCENAME:power_status)`: Power state (0=Off, 1=On, 2=Cooling, 3=Warming)
- `$(INSTANCENAME:shutter_status)`: Shutter state (0=Open, 1=Closed)
- `$(INSTANCENAME:signal_status)`: Signal presence indicator
- `$(INSTANCENAME:current_input)`: Active input number

### Lamp Variables
For each lamp (replace X with 1-6):
- `$(INSTANCENAME:lamp_X_state)`: Lamp state
- `$(INSTANCENAME:lamp_X_hours)`: Runtime in HH:MM format
- `$(INSTANCENAME:lamp_X_status)`: Lamp status
- `$(INSTANCENAME:lamp_X_voltage)`: Operating voltage
- `$(INSTANCENAME:lamp_X_serial)`: Serial number
- `$(INSTANCENAME:lamp_X_install_date)`: Installation date

**Note**: For M-Series projectors, lamps 3-6 will show "N/A"

## Monitoring

### Status Polling
The module automatically polls projector status at your configured interval (default 3 seconds):
- Power state
- Shutter state
- Signal presence
- **Lamp voltage** (Boxer only) - updated every 3 seconds for real-time monitoring

### Lamp Info Polling
Static lamp information is polled every 30 minutes to track:
- Runtime hours
- Lamp state and status
- Serial numbers
- Installation dates

## Troubleshooting

### Module shows "Disconnected"
- Verify the projector IP address is correct
- Ensure port 3002 is accessible (check firewalls)
- Confirm the projector's network interface is enabled

### Auto-detection not working
- Check that the projector is powered on
- Try manually selecting the projector type in configuration
- Verify network connectivity

### Variables showing "Unknown"
- Wait for the first polling cycle to complete (a few seconds)
- Check the module's debug logs for errors
- Verify the projector is responding to commands

### Lamp information not updating
- Lamp polling occurs every 30 minutes
- Restart the module to trigger an immediate poll
- Some projector models may not support all lamp data fields

## Tips

1. **Use Auto-detect**: Let the module identify your projector automatically
2. **Monitor Lamp Hours**: Set up feedback with threshold alerts to track lamp life
3. **Custom Commands**: For advanced features, use Custom Command action with Christie API syntax
4. **Button Feedback**: Add power and shutter state feedbacks to buttons for visual confirmation

## Technical Details

- **Protocol**: Christie Serial API over TCP/IP
- **Port**: 3002 (default)
- **Command Format**: ASCII commands wrapped in parentheses
- **Response Timeout**: 1000ms
- **Command Queue**: Sequential execution prevents conflicts

## Support

For questions, issues, or feature requests, please visit the module's repository on GitHub.
