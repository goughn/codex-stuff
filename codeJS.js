var pyodideReadyPromise = loadPyodide();
console.log("type 106 github v3.7");
console.log("=== codeJS.js LOADED ===", new Date().toISOString());

function createTextArea() {
    // Find the first element with class 'instanceHolder'
    var closeHolderDiv = document.querySelector('.instanceHolder');

    if (closeHolderDiv) {
      // Create the textarea
      var textarea = document.createElement('textarea');
      //textarea.id = 'console-output';
      
      // Optional: Set some default styles or attributes
      textarea.rows = 10;
      textarea.cols = 50;
      textarea.placeholder = 'Console output will appear here...';

      // Append the textarea to the div
      closeHolderDiv.appendChild(textarea);
    } else {
      console.warn('No element with class "instanceHolder" found.');
    }
}


function setItem_106(itemInstance, instanceObj) {
    console.log("=== setItem_106 START ===", new Date().toISOString());
    console.log("Item Instance:", {
        id: itemInstance.id,
        className: itemInstance.className,
        childNodes: itemInstance.childNodes.length,
        html: itemInstance.innerHTML.substring(0, 200) + "..."
    });
    console.log("Instance Object:", {
        iid: instanceObj.iid,
        type: instanceObj.type,
        keys: Object.keys(instanceObj)
    });
    
    // COMPREHENSIVE DEBUGGING: Log ALL properties of instanceObj
    console.log("=== FULL INSTANCE OBJECT DEBUG ===");
    console.log("instanceObj:", instanceObj);
    console.log("instanceObj keys:", Object.keys(instanceObj));
    
    // Check specifically for evaluation-related properties
    console.log("=== EVALUATION DATA SEARCH ===");
    console.log("instanceObj.evaluation:", instanceObj.evaluation);
    console.log("instanceObj.evaluations:", instanceObj.evaluations);
    console.log("instanceObj.eval:", instanceObj.eval);
    console.log("instanceObj.tests:", instanceObj.tests);
    console.log("instanceObj.answer:", instanceObj.answer);
    console.log("instanceObj.solution:", instanceObj.solution);
    console.log("instanceObj.content:", instanceObj.content);
    console.log("instanceObj.itemcontent:", instanceObj.itemcontent);
    
    // Log all properties that might contain evaluation data
    Object.keys(instanceObj).forEach(key => {
        const value = instanceObj[key];
        if (typeof value === 'string' && value.includes('evaluation')) {
            console.log(`Property ${key} contains 'evaluation':`, value);
        }
        if (typeof value === 'string' && (value.startsWith('[') || value.startsWith('{'))) {
            try {
                const parsed = JSON.parse(value);
                console.log(`Property ${key} contains JSON:`, parsed);
            } catch (e) {
                // Not JSON, ignore
            }
        }
    });
    
    // Store instanceObj for later use in testing
    itemInstance._instanceObj = instanceObj;
    
    // Get the answer element
    const answerElement = itemInstance.querySelector(".answer");
    console.log("Answer Element Details:", {
        found: !!answerElement,
        id: answerElement?.id,
        className: answerElement?.className,
        value: answerElement?.value?.substring(0, 50) + "...",
        parentNode: answerElement?.parentNode?.id
    });
    
    if (!answerElement) {
        console.error("No answer element found in:", {
            itemId: itemInstance.id,
            html: itemInstance.innerHTML.substring(0, 200) + "..."
        });
        return;
    }

    // Handle existing answer
    if (answerElement.value.trim() !== "") {
        try {
            const resp = JSON.parse(answerElement.value);
            answerElement.value = resp.code;
            console.log("Restored previous answer:", {
                codeLength: resp.code.length,
                outputLength: resp.output?.length
            });
        } catch (e) {
            console.log("Error parsing answer:", e);
        }
    }
    
    // Create output div
    const itemid = itemInstance.id;
    console.log("Creating output div:", {
        id: "o" + itemid,
        parentId: answerElement.parentNode.id
    });
    
    const outputDiv = document.createElement("div");
    outputDiv.id = "o" + itemid;
    outputDiv.className = "itemContent viewAnswer";
    outputDiv.style.backgroundColor = "white";
    outputDiv.style.width = "50%";
    outputDiv.style.float = "right";
    
    // Insert output div before answer
    console.log("Inserting output div:", {
        before: answerElement.previousSibling?.id,
        after: answerElement.nextSibling?.id
    });
    answerElement.parentNode.insertBefore(outputDiv, answerElement);
    answerElement.style.width = "44%";
    answerElement.id = "t" + itemid;
    
    // Create buttons container
    console.log("Creating buttons container");
    const buttonsContainer = document.createElement("div");
    buttonsContainer.className = "python-buttons";
    buttonsContainer.style.marginTop = "10px";
    buttonsContainer.style.display = "flex";
    buttonsContainer.style.gap = "10px";
    console.log("Buttons container created:", {
        className: buttonsContainer.className,
        style: buttonsContainer.style.cssText
    });

    // Create Run button
    console.log("Creating Run button");
    const runButton = document.createElement("button");
    runButton.type = "button";
    runButton.className = "run-button";
    runButton.textContent = "Run Code";
    console.log("Run button created:", {
        type: runButton.type,
        className: runButton.className,
        textContent: runButton.textContent
    });
    
    runButton.onclick = async function() {
        console.log("Run button clicked");
        const originalText = this.textContent;
        this.textContent = "Running...";
        this.disabled = true;
        try {
            outputDiv.textContent = "";
            await runPython2(this);
        } finally {
            this.textContent = originalText;
            this.disabled = false;
            
            setTimeout(() => {
                const divMatplotlib = obtenerUltimoDivMatplotlib();
                if (divMatplotlib) {
                    console.log('Found matplotlib div:', divMatplotlib.id);
                    document.body.insertBefore(divMatplotlib, document.getElementsByClassName("banner")[0]);
                }
            }, 100);
        }
    };

    // Create Test button
    console.log("Creating Test button");
    const testButton = document.createElement("button");
    testButton.type = "button";
    testButton.className = "test-button";
    testButton.textContent = "Run Tests";
    console.log("Test button created:", {
        type: testButton.type,
        className: testButton.className,
        textContent: testButton.textContent
    });
    
    testButton.onclick = async function() {
        console.log("Test button clicked");
        const originalText = this.textContent;
        this.textContent = "Testing...";
        this.disabled = true;
        try {
            outputDiv.textContent = "";
            
            // Get tests from evaluation data or fallback
            let tests = getTestsFromEvaluationData(itemInstance);
            
            await runPythonTests(this, tests);
        } finally {
            this.textContent = originalText;
            this.disabled = false;
        }
    };

    // Add buttons to container
    console.log("Adding buttons to container");
    buttonsContainer.appendChild(runButton);
    buttonsContainer.appendChild(testButton);
    console.log("Buttons added to container:", {
        childNodes: buttonsContainer.childNodes.length,
        firstChild: buttonsContainer.firstChild?.className,
        lastChild: buttonsContainer.lastChild?.className
    });
    
    // Add buttons immediately after answer textarea
    console.log("Inserting buttons after answer textarea:", {
        answerId: answerElement.id,
        nextSibling: answerElement.nextSibling?.id
    });
    answerElement.parentNode.insertBefore(buttonsContainer, answerElement.nextSibling);
    console.log("Buttons inserted:", {
        parentNode: buttonsContainer.parentNode?.id,
        previousSibling: buttonsContainer.previousSibling?.id,
        nextSibling: buttonsContainer.nextSibling?.id
    });

    // Add styles
    const styleId = 'python-buttons-style';
    if (!document.getElementById(styleId)) {
        console.log("Adding button styles");
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            .python-buttons button {
                padding: 8px 16px;
                border: 1px solid #888;
                border-radius: 4px;
                cursor: pointer;
                font-weight: normal;
                background: #fff;
                color: #222;
                box-shadow: none;
                transition: background-color 0.2s, border-color 0.2s;
            }
            .python-buttons button:hover {
                background: #f0f0f0;
                border-color: #555;
            }
            .run-button, .test-button {
                /* No custom color, use default */
            }
            .run-button:disabled, .test-button:disabled {
                background-color: #eee;
                color: #aaa;
                border-color: #ccc;
                cursor: not-allowed;
            }
            
            /* Evaluation Status Styles */
            .evaluation-status {
                margin: 10px 0;
                padding: 10px;
                border-radius: 4px;
                border: 1px solid #ddd;
                background: #f9f9f9;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                font-size: 14px;
            }
            
            .status-text {
                margin-bottom: 8px;
                font-weight: 500;
            }
            
            .status-success {
                color: #10b981;
            }
            
            .status-warning {
                color: #f59e0b;
            }
            
            .status-error {
                color: #ef4444;
            }
            
            .debug-btn {
                padding: 4px 8px;
                font-size: 12px;
                background: #e5e7eb;
                border: 1px solid #d1d5db;
                border-radius: 3px;
                cursor: pointer;
                color: #374151;
            }
            
            .debug-btn:hover {
                background: #d1d5db;
            }
            
            .debug-info {
                margin-top: 8px;
                padding: 8px;
                background: #f3f4f6;
                border: 1px solid #d1d5db;
                border-radius: 3px;
                font-size: 12px;
            }
            
            .debug-info h4 {
                margin: 0 0 8px 0;
                font-size: 13px;
                color: #374151;
            }
            
            .debug-info p {
                margin: 4px 0;
                color: #6b7280;
            }
            
            .debug-info pre {
                margin: 4px 0;
                padding: 8px;
                background: #ffffff;
                border: 1px solid #e5e7eb;
                border-radius: 3px;
                font-size: 11px;
                overflow-x: auto;
                max-height: 200px;
                overflow-y: auto;
            }
        `;
        document.head.appendChild(style);
        console.log("Styles added to document head");
    }
    
    // Final verification
    console.log("Final DOM state:", {
        answerElement: {
            id: answerElement.id,
            nextSibling: answerElement.nextSibling?.className
        },
        buttonsContainer: {
            parentNode: buttonsContainer.parentNode?.id,
            childNodes: buttonsContainer.childNodes.length
        },
        outputDiv: {
            id: outputDiv.id,
            parentNode: outputDiv.parentNode?.id
        }
    });
    
    console.log("=== setItem_106 END ===", new Date().toISOString());
}

// Function to convert EditionMode evaluation data to test format
function getTestsFromEvaluationData(itemInstance) {
    console.log("=== getTestsFromEvaluationData START ===");
    
    const instanceObj = itemInstance._instanceObj;
    let tests = [];
    let evaluationSource = "none";
    let debugInfo = {
        searchedProperties: [],
        foundData: null,
        errors: []
    };
    
    // First, try to get from data-tests attribute (existing method)
    const problemElement = itemInstance.querySelector(".problem");
    if (problemElement) {
        const testCases = problemElement.getAttribute("data-tests");
        if (testCases) {
            try {
                tests = JSON.parse(testCases);
                evaluationSource = "data-tests";
                console.log("✅ Found tests in data-tests attribute:", tests.length);
                showEvaluationStatus(itemInstance, evaluationSource, tests.length, tests, null, debugInfo);
                return tests;
            } catch (e) {
                console.log("❌ Error parsing data-tests attribute:", e);
                debugInfo.errors.push("Error parsing data-tests: " + e.message);
            }
        }
    }
    
    // Try to get from data-demo attribute and auto-generate tests
    const demoElements = itemInstance.querySelectorAll("[data-demo]");
    if (demoElements.length > 0) {
        console.log("🔍 Found data-demo elements:", demoElements.length);
        
        for (let demoElement of demoElements) {
            const demoContent = demoElement.getAttribute("data-demo");
            if (demoContent && demoContent.includes("print(") && demoContent.includes("batuketa(")) {
                console.log("📝 Found demo content with batuketa function calls");
                
                try {
                    // Extract test cases from demo content
                    const lines = demoContent.split('\n');
                    const testLines = lines.filter(line => 
                        line.trim().startsWith('print(batuketa(') && line.includes('#')
                    );
                    
                    if (testLines.length > 0) {
                        tests = testLines.map((line, index) => {
                            // Extract function call and expected result
                            const printMatch = line.match(/print\((.*?)\)/);
                            const commentMatch = line.match(/#\s*(.+)/);
                            
                            if (printMatch && commentMatch) {
                                const functionCall = printMatch[1].trim();
                                const expectedResult = commentMatch[1].trim();
                                
                                return {
                                    id: index + 1,
                                    description: `Test ${functionCall}`,
                                    test: `result = ${functionCall}\nassert result == ${expectedResult}, f"Expected ${expectedResult}, got {result}"`
                                };
                            }
                            return null;
                        }).filter(test => test !== null);
                        
                        if (tests.length > 0) {
                            evaluationSource = "data-demo";
                            console.log(`✅ Generated ${tests.length} tests from data-demo`);
                            showEvaluationStatus(itemInstance, evaluationSource, tests.length, tests, null, debugInfo);
                            return tests;
                        }
                    }
                } catch (e) {
                    console.log("❌ Error processing data-demo:", e);
                    debugInfo.errors.push("Error processing data-demo: " + e.message);
                }
            }
        }
    }
    
    // Search for evaluation data in various possible properties
    const possibleEvalProperties = [
        'evaluation', 'evaluations', 'eval', 'tests', 
        'answer', 'solution', 'content', 'itemcontent',
        'data', 'metadata', 'config', 'settings'
    ];
    
    console.log("🔍 Searching for evaluation data in instanceObj properties...");
    
    for (const prop of possibleEvalProperties) {
        debugInfo.searchedProperties.push(prop);
        
        if (instanceObj && instanceObj[prop]) {
            console.log(`🔍 Checking property '${prop}':`, instanceObj[prop]);
            
            let evaluationData = null;
            
            try {
                // Try to parse if it's a string
                if (typeof instanceObj[prop] === 'string') {
                    // Check if it looks like JSON
                    if (instanceObj[prop].trim().startsWith('[') || instanceObj[prop].trim().startsWith('{')) {
                        evaluationData = JSON.parse(instanceObj[prop]);
                        console.log(`📝 Parsed JSON from '${prop}':`, evaluationData);
                    } else {
                        console.log(`📝 String content in '${prop}':`, instanceObj[prop]);
                        continue;
                    }
                } else if (typeof instanceObj[prop] === 'object') {
                    evaluationData = instanceObj[prop];
                    console.log(`📝 Object in '${prop}':`, evaluationData);
                }
                
                // Check if this looks like evaluation data
                if (evaluationData && Array.isArray(evaluationData)) {
                    console.log(`✅ Found array in '${prop}' with ${evaluationData.length} items`);
                    
                    // Check if array items look like evaluation objects
                    const hasEvalStructure = evaluationData.some(item => 
                        item && (item.input || item.test || item.output || item.mark)
                    );
                    
                    if (hasEvalStructure) {
                        console.log(`✅ Array in '${prop}' looks like evaluation data!`);
                        debugInfo.foundData = { property: prop, data: evaluationData };
                        
                        // Convert to test format
                        tests = evaluationData.map((evaluation, index) => {
                            let testCode = '';
                            
                            if (evaluation.input && evaluation.output) {
                                const input = evaluation.input.trim();
                                const expectedOutput = evaluation.output.trim();
                                
                                if (input.includes('(') && input.includes(')')) {
                                    testCode = `
${input}
result = locals().get('result', None)
expected = "${expectedOutput}"
if str(result).strip() == expected:
    pass  # Test passed
else:
    assert False, f"Expected '{expected}', got '{result}'"`;
                                } else {
                                    testCode = `
${input}
expected = "${expectedOutput}"
assert str(result).strip() == expected, f"Expected '{expected}', got '{result}'"`;
                                }
                            } else if (evaluation.input) {
                                testCode = evaluation.input;
                            } else if (evaluation.test) {
                                testCode = evaluation.test;
                            } else {
                                return null;
                            }
                            
                            return {
                                id: index + 1,
                                description: evaluation.commentTrue || evaluation.description || `Test ${index + 1}`,
                                test: testCode.trim()
                            };
                        }).filter(test => test !== null);
                        
                        if (tests.length > 0) {
                            evaluationSource = `property-${prop}`;
                            console.log(`✅ Successfully converted ${tests.length} tests from '${prop}'`);
                            break;
                        }
                    }
                }
                
                // Check if it's an object that might contain evaluation data
                if (evaluationData && typeof evaluationData === 'object' && !Array.isArray(evaluationData)) {
                    console.log(`🔍 Checking object properties in '${prop}'`);
                    Object.keys(evaluationData).forEach(subKey => {
                        console.log(`  - ${subKey}:`, evaluationData[subKey]);
                    });
                }
                
            } catch (e) {
                console.log(`❌ Error processing '${prop}':`, e);
                debugInfo.errors.push(`Error processing ${prop}: ${e.message}`);
            }
        } else {
            console.log(`❌ Property '${prop}' not found or empty`);
        }
    }
    
    // Show evaluation status with debug info
    showEvaluationStatus(itemInstance, evaluationSource, tests.length, tests, instanceObj, debugInfo);
    
    console.log("=== getTestsFromEvaluationData END ===", tests.length, "tests");
    return tests;
}

// Function to show evaluation status and debugging info
function showEvaluationStatus(itemInstance, source, testCount, tests, rawData, debugInfo) {
    const instanceID = itemInstance.getAttribute("id");
    let statusDiv = document.getElementById("eval-status-" + instanceID);
    
    if (!statusDiv) {
        statusDiv = document.createElement("div");
        statusDiv.id = "eval-status-" + instanceID;
        statusDiv.className = "evaluation-status";
        
        // Insert after the buttons
        const buttonsContainer = itemInstance.querySelector(".python-buttons");
        if (buttonsContainer && buttonsContainer.parentNode) {
            buttonsContainer.parentNode.insertBefore(statusDiv, buttonsContainer.nextSibling);
        }
    }
    
    let statusText = "";
    let statusClass = "";
    
    if (source.startsWith("property-")) {
        const propertyName = source.replace("property-", "");
        statusText = `✅ Tests converted from instanceObj.${propertyName} (${testCount} tests)`;
        statusClass = "status-success";
    } else {
        switch(source) {
            case "data-tests":
                statusText = `✅ Tests loaded from data-tests attribute (${testCount} tests)`;
                statusClass = "status-success";
                break;
            case "data-demo":
                statusText = `✅ Tests generated from data-demo attribute (${testCount} tests)`;
                statusClass = "status-success";
                break;
            case "instanceObj":
                statusText = `✅ Tests converted from evaluation data (${testCount} tests)`;
                statusClass = "status-success";
                break;
            case "error":
                statusText = `❌ Error processing evaluation data`;
                statusClass = "status-error";
                break;
            case "none":
            default:
                statusText = `⚠️ No evaluation data found - tests will not run`;
                statusClass = "status-warning";
                break;
        }
    }
    
    const debugInfoHtml = debugInfo ? `
        <p><strong>Searched Properties:</strong> ${debugInfo.searchedProperties.join(", ")}</p>
        ${debugInfo.foundData ? `<p><strong>Found Data In:</strong> ${debugInfo.foundData.property}</p>` : ''}
        ${debugInfo.errors.length > 0 ? `<p><strong>Errors:</strong><br>${debugInfo.errors.join('<br>')}</p>` : ''}
        <p><strong>All instanceObj Keys:</strong> ${rawData ? Object.keys(rawData).join(", ") : 'N/A'}</p>
    ` : '';
    
    statusDiv.innerHTML = `
        <div class="status-text ${statusClass}">${statusText}</div>
        <button type="button" class="debug-btn" onclick="toggleEvaluationDebug('${instanceID}')">Debug Info</button>
        <div id="debug-info-${instanceID}" class="debug-info" style="display: none;">
            <h4>Debug Information:</h4>
            <p><strong>Source:</strong> ${source}</p>
            <p><strong>Test Count:</strong> ${testCount}</p>
            ${debugInfoHtml}
            <p><strong>Tests:</strong></p>
            <pre>${JSON.stringify(tests, null, 2)}</pre>
            ${rawData ? `<p><strong>Raw instanceObj:</strong></p><pre>${JSON.stringify(rawData, null, 2)}</pre>` : ''}
        </div>
    `;
}

// Function to toggle debug info visibility
function toggleEvaluationDebug(instanceID) {
    const debugDiv = document.getElementById("debug-info-" + instanceID);
    if (debugDiv) {
        debugDiv.style.display = debugDiv.style.display === "none" ? "block" : "none";
    }
}

function obtenerUltimoDivMatplotlib() {
    var divsEnBody = document.body.querySelectorAll('body > div');
    
    if (divsEnBody.length > 0) {
        var ultimoDiv = divsEnBody[divsEnBody.length - 1];
        
        if (ultimoDiv.id && ultimoDiv.id.startsWith('matplotlib')) {
            return ultimoDiv;
        }
    }
    
    return null;
}

async function runPython2(button) {
  var pyodide = await pyodideReadyPromise;
  await pyodide.loadPackage("numpy");
  await pyodide.loadPackage("matplotlib");
  //var code = document.getElementById("python-code").value;

    itemInstance = button.closest(".itemInstance");
    instanceID = itemInstance.getAttribute("id");
    pyCode = itemInstance.querySelector(".answer").value;

  // Redirige stdout
  //let outputDiv = document.getElementById("console-output");
  let outputDiv = document.getElementById("o" + instanceID);
  outputDiv.textContent = "";

  pyodide.setStdout({
    batched: (s) => outputDiv.textContent += s,
  });

  pyodide.setStderr({
    batched: (s) => outputDiv.textContent += s,
  });

  try {
    await pyodide.runPythonAsync(pyCode);
  } catch (err) {
    outputDiv.textContent += "\n" + err;
  }
}

function saveAnswer_106(button) {
    var respObject = {};
    itemInstance = button.closest(".itemInstance");
    pyCode = itemInstance.querySelector(".answer").value;
    respObject.code = pyCode;

    // Get the output div and its content
    let outputDiv = document.getElementById("o" + itemInstance.id);
    if (outputDiv) {
        output = outputDiv.textContent;
        respObject.output = output;
    } else {
        respObject.output = "";
    }
    
    // Store the response in the answer element
    answerElement = itemInstance.querySelector(".answer");
    answerElement.value = JSON.stringify(respObject);
    
    return JSON.stringify(respObject);
}

async function runPythonTests(button, tests) {
    const itemInstance = button.closest(".itemInstance");
    const instanceID = itemInstance.getAttribute("id");
    const outputDiv = document.getElementById("o" + instanceID);
    const pyCode = itemInstance.querySelector(".answer").value;
    
    // Check if tests are available
    if (!tests || tests.length === 0) {
        outputDiv.textContent = "❌ No tests available to run.\n\nTo add tests:\n1. Use EditionMode to create evaluation data\n2. Or add data-tests attribute to the problem element\n3. Check the Debug Info below for details";
        return;
    }
    
    // Ensure marksDiv exists below outputDiv
    let marksDiv = document.getElementById("marks-" + instanceID);
    if (!marksDiv) {
        marksDiv = document.createElement("div");
        marksDiv.id = "marks-" + instanceID;
        marksDiv.className = "marks-summary";
        outputDiv.parentNode.insertBefore(marksDiv, outputDiv.nextSibling);
    }
    marksDiv.textContent = "";

    // Clear previous output
    outputDiv.textContent = "";
    
    const pyodide = await pyodideReadyPromise;
    let totalMarks = 0;
    
    // Set up stdout/stderr redirection for first test only
    pyodide.setStdout({
        batched: (s) => outputDiv.textContent += s,
    });
    pyodide.setStderr({
        batched: (s) => outputDiv.textContent += s,
    });
    
    try {
        // Run first test immediately
        let firstTestPassed = false;
        try {
            await pyodide.runPythonAsync(pyCode);
            await pyodide.runPythonAsync(tests[0].test);
            totalMarks++;
            firstTestPassed = true;
        } catch (error) {
            outputDiv.textContent += `\n${error}`;
        }
        // Show initial marks after first test
        marksDiv.textContent = `Marks ${totalMarks}/${tests.length}`;
        
        // Disable output for remaining tests by setting null handlers
        pyodide.setStdout({
            batched: (s) => {}, // Ignore output
        });
        pyodide.setStderr({
            batched: (s) => {}, // Ignore errors
        });
        
        // Run remaining tests asynchronously (do not update outputDiv)
        if (tests.length > 1) {
            const remainingTests = tests.slice(1);
            const promises = remainingTests.map(async (test) => {
                try {
                    await pyodide.runPythonAsync(pyCode);
                    await pyodide.runPythonAsync(test.test);
                    totalMarks++;
                } catch (error) {
                    // Do not update outputDiv, just ignore or log
                }
                // Update marksDiv after each test
                marksDiv.textContent = `Marks ${totalMarks}/${tests.length}`;
            });
            await Promise.all(promises);
        }
    } catch (error) {
        outputDiv.textContent += `\nError running tests: ${error}`;
    }
}

// Add styles only if they don't exist
(function() {
    const styleId = 'python-test-result-style-v2';
    if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            .test-status {
                margin: 10px 0;
                padding: 8px;
                background-color: #f8f9fa;
                border-radius: 4px;
            }
            .test-list {
                margin-top: 10px;
            }
            .test-result {
                margin: 5px 0;
                padding: 5px;
                font-family: monospace;
                white-space: pre-wrap;
            }
        `;
        document.head.appendChild(style);
    }
})();
