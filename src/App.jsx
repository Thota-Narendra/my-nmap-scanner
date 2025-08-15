import React, { useState, useEffect } from 'react';

export default function App() {
    const [target, setTarget] = useState('google.com');
    const [ports, setPorts] = useState('1-100');
    const [scanType, setScanType] = useState('tcp-connect'); // Already set, just confirming
    const [pingScan, setPingScan] = useState(false);
    const [skipDiscovery, setSkipDiscovery] = useState(false);
    const [versionDetection, setVersionDetection] = useState(false);
    const [osDetection, setOsDetection] = useState(false);
    const [scriptScan, setScriptScan] = useState(false);
    const [aggressiveScan, setAggressiveScan] = useState(false);
    const [fullScan, setFullScan] = useState(false);
    const [fastScan, setFastScan] = useState(false);
    const [topPorts, setTopPorts] = useState(false);
    const [timing, setTiming] = useState('3');
    const [verbose, setVerbose] = useState('1');
    const [results, setResults] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (fullScan) {
            setPorts('1-65535');
            setFastScan(false);
            setTopPorts(false);
        } else if (fastScan) {
            setPorts('top-100');
            setFullScan(false);
            setTopPorts(false);
        } else if (topPorts) {
            setPorts('top-1000');
            setFullScan(false);
            setFastScan(false);
        }
    }, [fullScan, fastScan, topPorts]);

    useEffect(() => {
        if (aggressiveScan) {
            setOsDetection(true);
            setVersionDetection(true);
            setScriptScan(true);
        }
    }, [aggressiveScan]);

   const handleScan = async () => {
    setIsLoading(true);
    setError(null);
    setResults(null);

    const scanOptions = [];

    const scanTypeMap = {
        'tcp-connect': '-sT',
        'syn-scan': '-sS',
        'ack-scan': '-sA',
        'window-scan': '-sW',
        'xmas-scan': '-sX',
        'null-scan': '-sN',
        'fin-scan': '-sF',
        'udp-scan': '-sU'
    };

    if (!pingScan) {
        scanOptions.push(scanTypeMap[scanType]);
        if (ports && !fullScan && !fastScan && !topPorts) {
            scanOptions.push('-p', ports);
        }
    } else {
        scanOptions.push('-sn'); // Only add -sn for ping scan
    }

    // Rest of the options
    if (skipDiscovery) scanOptions.push('-Pn');
    if (versionDetection) scanOptions.push('-sV');
    if (osDetection) scanOptions.push('-O');
    if (scriptScan) scanOptions.push('-sC');
    if (aggressiveScan) scanOptions.push('-A');
    if (fullScan) scanOptions.push('-p-');
    if (fastScan) scanOptions.push('-F');
    if (topPorts) scanOptions.push('--top-ports', '1000');

    scanOptions.push(`-T${timing}`);
    if (Number(verbose) > 0) {
        scanOptions.push(`-${'v'.repeat(Number(verbose))}`);
    }

    const scanData = {
        target: target,
        scan_options: scanOptions,
    };


        
        try {
            // The TypeError: Failed to fetch error typically means the browser
            // could not connect to the Python server.
            // Ensure the Python server is running in a separate terminal via:
            // python server.py
            const response = await fetch('http://localhost:5000/scan', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(scanData),
            });

            if (!response.ok) {
                throw new Error(`Server responded with status: ${response.status}`);
            }

            const result = await response.json();

            if (result.error) {
                throw new Error(result.error);
            }

            setResults(result);

        } catch (e) {
            console.error(e);
            setError("An error occurred during the scan. Please ensure the Python server is running.");
        } finally {
            setIsLoading(false);
        }
    };

    const ResultTable = ({ data }) => (
        <div className="bg-gray-700 p-6 rounded-lg shadow-lg mt-6 animate-fadeIn border border-gray-600">
            <h3 className="text-xl font-bold mb-4 text-white">Scan Results</h3>
            {data.results && data.results.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-600">
                        <thead className="bg-gray-600">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Port</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Protocol</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">State</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Service</th>
                        </tr>
                        </thead>
                        <tbody className="bg-gray-800 divide-y divide-gray-600">
                        {data.results.map((item, index) => {
                            const service = item.service || 'unknown';
                            return (
                                <tr key={index} className="hover:bg-gray-700 transition-colors duration-200">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{parseInt(item.port)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{item.protocol}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`inline-flex px-2 text-xs font-semibold leading-5 rounded-full ${
                          item.state === 'open' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                      }`}>
                        {item.state}
                      </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{service}</td>
                                </tr>
                            );
                        })}
                        </tbody>
                    </table>
                </div>
            ) : (
                <p className="text-gray-400 text-center italic">No Hole To Enter LoL!!!!</p>
            )}
            {data.summary && (
                <p className="mt-4 text-gray-400 text-sm">{data.summary}</p>
            )}
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-slate-950 text-gray-300 font-inter p-4 flex items-center justify-center">
            <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-in-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        /* Style for Range Input */
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 1rem;
          height: 1rem;
          background-color: #38bdf8;
          border-radius: 9999px;
          cursor: pointer;
          border: 2px solid #075985;
          margin-top: -6px;
          transition: transform 0.2s ease-in-out;
        }
        input[type="range"]::-moz-range-thumb {
          width: 1rem;
          height: 1rem;
          background-color: #38bdf8;
          border-radius: 9999px;
          cursor: pointer;
          border: 2px solid #075985;
          transition: transform 0.2s ease-in-out;
        }
        input[type="range"]::-webkit-slider-thumb:hover {
          transform: scale(1.2);
        }
        input[type="range"]::-moz-range-thumb:hover {
          transform: scale(1.2);
        }
        input[type="range"]::-webkit-slider-runnable-track {
          width: 100%;
          height: 4px;
          cursor: pointer;
          background: #4b5563;
          border-radius: 1.5rem;
        }
        input[type="range"]::-moz-range-track {
          width: 100%;
          height: 4px;
          cursor: pointer;
          background: #4b5563;
          border-radius: 1.5rem;
        }
      `}</style>
            <div className="w-full max-w-2xl bg-gray-800 p-8 rounded-2xl shadow-2xl border-2 border-blue-400/20">
                <h1 className="text-3xl font-extrabold text-center text-blue-400 mb-6 drop-shadow-lg tracking-wide">
                    Thota's Web Scanner
                </h1>
                <p className="text-gray-400 text-center mb-8 font-light">
                    A dynamic, web-based interface for Port scanning.
                </p>

                {/* Input Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div>
                        <label htmlFor="target" className="block text-sm font-medium text-gray-300 mb-2">Target IP or Hostname</label>
                        <input
                            type="text"
                            id="target"
                            value={target}
                            onChange={(e) => setTarget(e.target.value)}
                            placeholder="e.g., google.com"
                            className="w-full px-4 py-2 bg-gray-700 text-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 border-2 border-gray-600 transition-colors duration-200"
                        />
                    </div>
                    <div>
                        <label htmlFor="ports" className="block text-sm font-medium text-gray-300 mb-2">Port(s) or Range</label>
                        <input
                            type="text"
                            id="ports"
                            value={ports}
                            onChange={(e) => setPorts(e.target.value)}
                            placeholder="e.g., 80,443 or 1-1024"
                            className="w-full px-4 py-2 bg-gray-700 text-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 border-2 border-gray-600 transition-colors duration-200"
                            disabled={fullScan || fastScan || topPorts}
                        />
                    </div>
                    <div>
                        <label htmlFor="scan-type" className="block text-sm font-medium text-gray-300 mb-2">Scan Technique</label>
                        <select
                            id="scan-type"
                            value={scanType}
                            onChange={(e) => setScanType(e.target.value)}
                            className="w-full px-4 py-2 bg-gray-700 text-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 border-2 border-gray-600 transition-colors duration-200"
                        >
                            <option value="tcp-connect">TCP Connect (-sT)</option>
                            <option value="syn-scan">SYN Scan (-sS)</option>
                            <option value="ack-scan">TCP ACK Scan (-sA)</option>
                            <option value="window-scan">TCP Window Scan (-sW)</option>
                            <option value="xmas-scan">Xmas Scan (-sX)</option>
                            <option value="null-scan">Null Scan (-sN)</option>
                            <option value="fin-scan">FIN Scan (-sF)</option>
                            <option value="udp-scan">UDP Scan (-sU)</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="timing" className="block text-sm font-medium text-gray-300 mb-2">Timing Template</label>
                        <input
                            type="range"
                            id="timing"
                            min="1"
                            max="5"
                            value={timing}
                            onChange={(e) => setTiming(e.target.value)}
                            className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer range-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                        <div className="flex justify-between text-xs text-gray-400 mt-1">
                            <span>-T1 (Slow)</span>
                            <span>-T5 (Fast)</span>
                        </div>
                    </div>
                    <div className="col-span-1 md:col-span-2">
                        <label htmlFor="verbose" className="block text-sm font-medium text-gray-300 mb-2">Verbose Level</label>
                        <input
                            type="range"
                            id="verbose"
                            min="0"
                            max="5"
                            value={verbose}
                            onChange={(e) => setVerbose(e.target.value)}
                            className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer range-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                        <div className="flex justify-between text-xs text-gray-400 mt-1">
                            <span>0 (Silent)</span>
                            <span>5 (-vvvvv)</span>
                        </div>
                    </div>

                    {/* New Checkboxes */}
                    <div className="col-span-1 md:col-span-2 flex flex-wrap gap-4">
                        <label className="flex items-center text-sm font-medium text-gray-300 transition-colors duration-200 hover:text-green-400">
                            <input
                                type="checkbox"
                                className="form-checkbox h-4 w-4 text-green-400 bg-gray-700 border-gray-600 rounded"
                                checked={pingScan}
                                onChange={(e) => setPingScan(e.target.checked)}
                            />
                            <span className="ml-2">Ping Scan (-sn)</span>
                        </label>
                        <label className="flex items-center text-sm font-medium text-gray-300 transition-colors duration-200 hover:text-yellow-400">
                            <input
                                type="checkbox"
                                className="form-checkbox h-4 w-4 text-yellow-400 bg-gray-700 border-gray-600 rounded"
                                checked={skipDiscovery}
                                onChange={(e) => setSkipDiscovery(e.target.checked)}
                            />
                            <span className="ml-2">Skip Host Discovery (-Pn)</span>
                        </label>
                        <label className="flex items-center text-sm font-medium text-gray-300 transition-colors duration-200 hover:text-purple-400">
                            <input
                                type="checkbox"
                                className="form-checkbox h-4 w-4 text-purple-400 bg-gray-700 border-gray-600 rounded"
                                checked={versionDetection}
                                onChange={(e) => setVersionDetection(e.target.checked)}
                                disabled={aggressiveScan}
                            />
                            <span className="ml-2">Version Detection (-sV)</span>
                        </label>
                        <label className="flex items-center text-sm font-medium text-gray-300 transition-colors duration-200 hover:text-rose-400">
                            <input
                                type="checkbox"
                                className="form-checkbox h-4 w-4 text-rose-400 bg-gray-700 border-gray-600 rounded"
                                checked={osDetection}
                                onChange={(e) => setOsDetection(e.target.checked)}
                                disabled={aggressiveScan}
                            />
                            <span className="ml-2">OS Detection (-O)</span>
                        </label>
                        <label className="flex items-center text-sm font-medium text-gray-300 transition-colors duration-200 hover:text-yellow-400">
                            <input
                                type="checkbox"
                                className="form-checkbox h-4 w-4 text-yellow-400 bg-gray-700 border-gray-600 rounded"
                                checked={scriptScan}
                                onChange={(e) => setScriptScan(e.target.checked)}
                                disabled={aggressiveScan}
                            />
                            <span className="ml-2">Script Scan (-sC)</span>
                        </label>
                        <label className="flex items-center text-sm font-medium text-gray-300 transition-colors duration-200 hover:text-blue-400">
                            <input
                                type="checkbox"
                                className="form-checkbox h-4 w-4 text-blue-400 bg-gray-700 border-gray-600 rounded"
                                checked={aggressiveScan}
                                onChange={(e) => setAggressiveScan(e.target.checked)}
                            />
                            <span className="ml-2">Aggressive Scan (-A)</span>
                        </label>
                        <label className="flex items-center text-sm font-medium text-gray-300 transition-colors duration-200 hover:text-purple-400">
                            <input
                                type="checkbox"
                                className="form-checkbox h-4 w-4 text-purple-400 bg-gray-700 border-gray-600 rounded"
                                checked={fullScan}
                                onChange={(e) => {
                                    setFullScan(e.target.checked);
                                    if (e.target.checked) {
                                        setFastScan(false);
                                        setTopPorts(false);
                                    }
                                }}
                            />
                            <span className="ml-2">Full Scan (-p-)</span>
                        </label>
                        <label className="flex items-center text-sm font-medium text-gray-300 transition-colors duration-200 hover:text-green-400">
                            <input
                                type="checkbox"
                                className="form-checkbox h-4 w-4 text-green-400 bg-gray-700 border-gray-600 rounded"
                                checked={fastScan}
                                onChange={(e) => {
                                    setFastScan(e.target.checked);
                                    if (e.target.checked) {
                                        setFullScan(false);
                                        setTopPorts(false);
                                    }
                                }}
                            />
                            <span className="ml-2">Fast Scan (-F)</span>
                        </label>
                        <label className="flex items-center text-sm font-medium text-gray-300 transition-colors duration-200 hover:text-rose-400">
                            <input
                                type="checkbox"
                                className="form-checkbox h-4 w-4 text-rose-400 bg-gray-700 border-gray-600 rounded"
                                checked={topPorts}
                                onChange={(e) => {
                                    setTopPorts(e.target.checked);
                                    if (e.target.checked) {
                                        setFullScan(false);
                                        setFastScan(false);
                                    }
                                }}
                            />
                            <span className="ml-2">Top 1000 Ports</span>
                        </label>
                    </div>
                </div>

                {/* Scan Button */}
                <button
                    onClick={handleScan}
                    disabled={isLoading}
                    className={`w-full py-3 px-6 rounded-md text-lg font-semibold transition-all duration-300 transform ${
                        isLoading
                            ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                            : 'bg-blue-400 hover:bg-blue-500 text-gray-900 hover:scale-105 shadow-lg'
                    }`}
                >
                    {isLoading ? (
                        <div className="flex items-center justify-center">
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Hold On Boss...
                        </div>
                    ) : (
                        'Start Scan'
                    )}
                </button>

                {/* Results Section */}
                {error && (
                    <div className="mt-6 p-4 bg-red-600 rounded-md text-white animate-fadeIn">
                        <p>{error}</p>
                    </div>
                )}
                {results && <ResultTable data={results} />}
            </div>
        </div>
    );
}
