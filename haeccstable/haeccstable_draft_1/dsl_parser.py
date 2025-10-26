"""
Simple DSL Parser for Haeccstable
Minimal implementation for proof-of-concept
"""

import re

class DSLError(Exception):
    """DSL parsing or execution error"""
    pass

class DSLParser:
    def __init__(self):
        self.variables = {}  # name -> type and value
        self.layers = {}     # name -> layer info
        self.buffers = {}    # name -> buffer info

    def parse_statement(self, statement):
        """Parse a single DSL statement and return commands for monitor"""
        statement = statement.strip()
        if not statement or statement.endswith(';'):
            statement = statement.rstrip(';')

        commands = []

        # in_var camera = webcam;
        if statement.startswith('in_var '):
            match = re.match(r'in_var\s+(\w+)\s*=\s*(\w+)', statement)
            if not match:
                raise DSLError(f"Invalid in_var syntax: {statement}")

            var_name, device = match.groups()
            self.variables[var_name] = {
                'type': 'in_var',
                'device': device
            }
            print(f"Created input variable '{var_name}' -> {device}")

        # out_var display = monitor1;
        elif statement.startswith('out_var '):
            match = re.match(r'out_var\s+(\w+)\s*=\s*(\w+)', statement)
            if not match:
                raise DSLError(f"Invalid out_var syntax: {statement}")

            var_name, monitor = match.groups()
            self.variables[var_name] = {
                'type': 'out_var',
                'monitor': monitor
            }
            print(f"Created output variable '{var_name}' -> {monitor}")

        # layer_obj video;
        elif statement.startswith('layer_obj '):
            match = re.match(r'layer_obj\s+(\w+)', statement)
            if not match:
                raise DSLError(f"Invalid layer_obj syntax: {statement}")

            layer_name = match.group(1)
            self.layers[layer_name] = {
                'name': layer_name,
                'canvas': None,
                'source': None,
                'transform': (0, 0),
                'scale': (1.0, 1.0),
                'opacity': 100
            }
            print(f"Created layer '{layer_name}'")

        # buffer_obj edges;
        elif statement.startswith('buffer_obj '):
            match = re.match(r'buffer_obj\s+(\w+)', statement)
            if not match:
                raise DSLError(f"Invalid buffer_obj syntax: {statement}")

            buffer_name = match.group(1)
            self.buffers[buffer_name] = {
                'name': buffer_name,
                'canvas': None,
                'format': 'rgba8'
            }
            print(f"Created buffer '{buffer_name}'")

        # video.canvas = (1920, 1080);
        elif '.canvas' in statement and '=' in statement:
            match = re.match(r'(\w+)\.canvas\s*=\s*\((\d+),\s*(\d+)\)', statement)
            if not match:
                raise DSLError(f"Invalid canvas syntax: {statement}")

            obj_name, width, height = match.groups()

            if obj_name in self.layers:
                self.layers[obj_name]['canvas'] = (int(width), int(height))
                print(f"Set layer '{obj_name}' canvas to {width}x{height}")
            elif obj_name in self.buffers:
                self.buffers[obj_name]['canvas'] = (int(width), int(height))
                print(f"Set buffer '{obj_name}' canvas to {width}x{height}")

        # edges.format = "r8";
        elif '.format' in statement and '=' in statement:
            match = re.match(r'(\w+)\.format\s*=\s*"(\w+)"', statement)
            if not match:
                raise DSLError(f"Invalid format syntax: {statement}")

            buffer_name, fmt = match.groups()

            if buffer_name in self.buffers:
                self.buffers[buffer_name]['format'] = fmt
                print(f"Set buffer '{buffer_name}' format to {fmt}")

        # camera.cast(video);
        elif '.cast(' in statement:
            match = re.match(r'(\w+)\.cast\((\w+)\)', statement)
            if not match:
                raise DSLError(f"Invalid cast syntax: {statement}")

            source_var, layer_name = match.groups()

            if source_var not in self.variables:
                raise DSLError(f"Unknown variable: {source_var}")
            if layer_name not in self.layers:
                raise DSLError(f"Unknown layer: {layer_name}")

            source_info = self.variables[source_var]
            if source_info['type'] != 'in_var':
                raise DSLError(f"Can only cast from in_var, not {source_info['type']}")

            self.layers[layer_name]['source'] = source_info['device']
            print(f"Bound {source_info['device']} to layer '{layer_name}'")

            # Send command to start video capture
            commands.append({
                'type': 'start_capture',
                'device': source_info['device'],
                'layer': layer_name
            })

        # display.project(video, 0);
        elif '.project(' in statement:
            match = re.match(r'(\w+)\.project\((\w+),\s*(\d+)\)', statement)
            if not match:
                raise DSLError(f"Invalid project syntax: {statement}")

            output_var, layer_name, z_index = match.groups()

            if output_var not in self.variables:
                raise DSLError(f"Unknown variable: {output_var}")
            if layer_name not in self.layers:
                raise DSLError(f"Unknown layer: {layer_name}")

            output_info = self.variables[output_var]
            if output_info['type'] != 'out_var':
                raise DSLError(f"Can only project to out_var, not {output_info['type']}")

            layer_info = self.layers[layer_name]

            # Send command to monitor
            commands.append({
                'type': 'project_layer',
                'monitor': output_info['monitor'],
                'layer': layer_info,
                'z_index': int(z_index)
            })

            print(f"Projected layer '{layer_name}' to {output_info['monitor']} at z={z_index}")

        # layer.transform(x, y);
        elif '.transform(' in statement:
            match = re.match(r'(\w+)\.transform\(([^,]+),\s*([^)]+)\)', statement)
            if not match:
                raise DSLError(f"Invalid transform syntax: {statement}")

            layer_name, x, y = match.groups()

            if layer_name not in self.layers:
                raise DSLError(f"Unknown layer: {layer_name}")

            self.layers[layer_name]['transform'] = (float(x), float(y))
            print(f"Set layer '{layer_name}' transform to ({x}, {y})")

        # layer.scale(sx, sy);
        elif '.scale(' in statement:
            match = re.match(r'(\w+)\.scale\(([^,]+),\s*([^)]+)\)', statement)
            if not match:
                raise DSLError(f"Invalid scale syntax: {statement}")

            layer_name, sx, sy = match.groups()

            if layer_name not in self.layers:
                raise DSLError(f"Unknown layer: {layer_name}")

            self.layers[layer_name]['scale'] = (float(sx), float(sy))
            print(f"Set layer '{layer_name}' scale to ({sx}, {sy})")

        # layer.opacity(value);
        elif '.opacity(' in statement:
            match = re.match(r'(\w+)\.opacity\((\d+)\)', statement)
            if not match:
                raise DSLError(f"Invalid opacity syntax: {statement}")

            layer_name, opacity = match.groups()

            if layer_name not in self.layers:
                raise DSLError(f"Unknown layer: {layer_name}")

            self.layers[layer_name]['opacity'] = int(opacity)
            print(f"Set layer '{layer_name}' opacity to {opacity}%")

        # import directory_name/filename.txt
        elif statement.startswith('import '):
            # Return special command for REPL to handle
            import_path = statement.replace('import', '').strip()
            commands.append({
                'type': 'import',
                'path': import_path
            })
            print(f"Importing: {import_path}")

        else:
            # Unknown statement - warn but don't error (for forward compatibility)
            if statement:
                print(f"Warning: Unrecognized statement: {statement}")

        return commands
