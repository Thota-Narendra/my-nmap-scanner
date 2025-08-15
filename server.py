from flask import Flask, request, jsonify
from flask_cors import CORS
import subprocess
import xml.etree.ElementTree as ET

app = Flask(__name__)
CORS(app) # Enable CORS for cross-origin requests

def run_nmap_scan(target, options):
    # nmap command to execute with XML output
    command = ["nmap"] + options + [target, "-oX", "-"]
    
    print(f"Running Nmap command: {' '.join(command)}")  # Log the full command
    
    try:
        # Use subprocess to run nmap and capture its output
        result = subprocess.run(command, capture_output=True, text=True, check=True)
        print(f"Nmap output: {result.stdout[:500]}...")  # Log first 500 chars of output
        return result.stdout
    except subprocess.CalledProcessError as e:
        error_msg = f"Nmap command failed: {e.stderr}"
        print(f"Subprocess error: {error_msg}")
        return f"<error>{error_msg}</error>"
    except FileNotFoundError:
        error_msg = "Nmap is not installed or not in the system's PATH."
        print(f"FileNotFoundError: {error_msg}")
        return f"<error>{error_msg}</error>"
    except Exception as e:
        error_msg = f"Unexpected error during Nmap execution: {str(e)}"
        print(f"Unexpected error: {error_msg}")
        return f"<error>{error_msg}</error>"
# A function to parse the XML output from nmap into JSON
def parse_nmap_xml(xml_output):
    results = []
    summary = "Scan completed."
    try:
        root = ET.fromstring(xml_output)
        
        # Get the scan summary
        runstats = root.find('runstats')
        if runstats:
            summary = runstats.find('finished').get('summary')

        # Get the host and port information
        for host in root.findall('host'):
            ports_element = host.find('ports')
            if ports_element is not None:
                for port in ports_element.findall('port'):
                    port_id = port.get('portid')
                    protocol = port.get('protocol')
                    state_element = port.find('state')
                    service_element = port.find('service')
                    
                    state = state_element.get('state') if state_element is not None else 'unknown'
                    service = service_element.get('name') if service_element is not None else 'unknown'

                    results.append({
                        "port": int(port_id),
                        "protocol": protocol,
                        "state": state,
                        "service": service
                    })
        
        return {"summary": summary, "results": results}
    except ET.ParseError:
        return {"summary": "Error parsing Nmap XML output.", "results": []}

@app.route('/scan', methods=['POST'])
def scan():
    data = request.get_json()
    
    target = data.get('target', 'scanme.nmap.org')
    scan_options = data.get('scan_options', [])

    print(f"Executing Nmap scan for {target} with options: {scan_options}")

    # Run the nmap command and get XML output
    xml_output = run_nmap_scan(target, scan_options)

    if xml_output.startswith("<error>"):
        return jsonify({"error": xml_output.replace("<error>", "").replace("</error>", "")}), 500
    
    try:
        # Parse the XML and return JSON
        parsed_results = parse_nmap_xml(xml_output)
        return jsonify(parsed_results)
    except Exception as e:
        print(f"Error parsing XML or returning results: {str(e)}")
        return jsonify({"error": f"Server error: {str(e)}"}), 500

if __name__ == '__main__':
    app.run(debug=True)