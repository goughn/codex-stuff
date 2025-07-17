var pyodideReadyPromise = loadPyodide();
console.log("type 106 github v4.5");
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

function displayMarksForSend(itemInstance, totalMarks, totalTests) {
    // Display marks immediately when Send button is clicked
    const instanceID = itemInstance.getAttribute("id");
    const outputDiv = document.getElementById("o" + instanceID);
    
    // Create or update marks display
    let marksDiv = document.getElementById("marks-" + instanceID);
    if (!marksDiv) {
        marksDiv = document.createElement("div");
        marksDiv.id = "marks-" + instanceID;
        marksDiv.className = "marks-summary";
        marksDiv.style.cssText = `
            margin: 10px 0;
            padding: 15px;
            background: #d4edda;
            border: 1px solid #c3e6cb;
            border-radius: 4px;
            font-weight: bold;
            color: #155724;
            font-size: 16px;
        `;
        
        // Insert after the output div
        if (outputDiv && outputDiv.parentNode) {
            outputDiv.parentNode.insertBefore(marksDiv, outputDiv.nextSibling);
        }
    }
    
    // Show the final marks
    const percentage = Math.round((totalMarks / totalTests) * 100);
    marksDiv.innerHTML = `
        <div>✅ <strong>Evaluation Complete!</strong></div>
        <div>Score: <strong>${totalMarks}/${totalTests}</strong> tests passed (${percentage}%)</div>
    `;
    
    console.log(`Marks displayed: ${totalMarks}/${totalTests} (${percentage}%)`);
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
    
    // Include evaluation data if tests were run
    if (itemInstance._testResults) {
        const { totalMarks, totalTests } = itemInstance._testResults;
        respObject.marks = totalMarks;
        respObject.totalTests = totalTests;
        respObject.percentage = Math.round((totalMarks / totalTests) * 100);
        respObject.evaluationCompleted = true;
        
        // Display marks immediately when Send is clicked
        displayMarksForSend(itemInstance, totalMarks, totalTests);
    } else {
        // No tests run yet
        respObject.evaluationCompleted = false;
        respObject.message = "Tests not run - click 'Run Tests' first for evaluation";
    }
    
    // The system gets the answer from the return value, but also needs it in the textarea
    // Store temporarily for system to read, then restore user code
    answerElement = itemInstance.querySelector(".answer");
    const originalCode = pyCode; // Save the original user code
    answerElement.value = JSON.stringify(respObject);
    
    // Restore user's original code immediately after the system reads it
    // Use a very short delay to ensure system has time to read the JSON
    requestAnimationFrame(() => {
        answerElement.value = originalCode;
    });
    
    return JSON.stringify(respObject);
}


async function runPythonTests(button, tests) {
    const itemInstance = button.closest(".itemInstance");
    const instanceID = itemInstance.getAttribute("id");
    const outputDiv = document.getElementById("o" + instanceID);
    const pyCode = itemInstance.querySelector(".answer").value;
    
    // Check if tests are available
    if (!tests || tests.length === 0) {
        outputDiv.textContent = "No tests available to run.\n\nTo add tests:\n1. Use EditionMode to create evaluation data\n2. Or add data-tests attribute to the problem element\n3. Check the Debug Info below for details";
        return;
    }
    
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
        
        // DON'T show marks - just store the result for later
        // Store test results on the item instance for later use by Send button
        itemInstance._testResults = { totalMarks: 1, totalTests: tests.length };
        
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
            for (const test of remainingTests) {
                try {
                    await pyodide.runPythonAsync(pyCode);
                    await pyodide.runPythonAsync(test.test);
                    totalMarks++;
                } catch (error) {
                    // Do not update outputDiv, just ignore or log
                    console.log(`Test ${test.id} failed:`, error);
                }
            }
        }
        
        // Store final test results for Send button
        itemInstance._testResults = { totalMarks: totalMarks, totalTests: tests.length };
        
        // Show completion message instead of marks
        outputDiv.textContent += `\n\nTests completed. Click 'Send' to see your score.`;
        
    } catch (error) {
        outputDiv.textContent += `\nError running tests: ${error}`;
        itemInstance._testResults = { totalMarks: 0, totalTests: tests.length };
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

// Function to convert EditionMode evaluation data to test format
function getTestsFromEvaluationData(itemInstance) {
    console.log("=== getTestsFromEvaluationData START ===");
    
    const instanceObj = itemInstance._instanceObj;
    let tests = [];
    let statusMessage = "";
    let debugInfo = [];
    
    debugInfo.push("Starting test search...");
    
    // Method 1: Try to get from data-tests attribute (existing method)
    const problemElement = itemInstance.querySelector(".problem");
    debugInfo.push(`Found .problem element: ${!!problemElement}`);
    
    if (problemElement) {
        const testCases = problemElement.getAttribute("data-tests");
        debugInfo.push(`Found data-tests attribute: ${!!testCases}`);
        debugInfo.push(`data-tests content length: ${testCases?.length || 0}`);
        
        if (testCases) {
            try {
                tests = JSON.parse(testCases);
                console.log("✅ Found tests in data-tests attribute:", tests.length);
                statusMessage = `✅ Tests loaded from data-tests attribute (${tests.length} tests)`;
                showEvaluationStatus(itemInstance, statusMessage, tests, debugInfo, "data-tests");
                return tests;
            } catch (e) {
                debugInfo.push(`Error parsing data-tests: ${e.message}`);
                console.log("Error parsing data-tests attribute:", e);
            }
        }
        
        // Method 2: Try data-test-cases attribute (simple format)
        const testCasesSimple = problemElement.getAttribute("data-test-cases");
        debugInfo.push(`Found data-test-cases attribute: ${!!testCasesSimple}`);
        
        if (testCasesSimple) {
            try {
                // Parse format like: "batuketa(2,3):5|batuketa(0,0):0|batuketa(-1,1):0"
                const cases = testCasesSimple.split('|');
                tests = cases.map((testCase, index) => {
                    const [input, expectedOutput] = testCase.split(':');
                    return {
                        id: index + 1,
                        description: `Test ${index + 1}: ${input.trim()}`,
                        test: `result = ${input.trim()}\nassert result == ${expectedOutput.trim()}, f"Expected ${expectedOutput.trim()}, got {result}"`
                    };
                });
                console.log("✅ Generated tests from data-test-cases:", tests.length);
                statusMessage = `✅ Tests generated from data-test-cases attribute (${tests.length} tests)`;
                showEvaluationStatus(itemInstance, statusMessage, tests, debugInfo, "data-test-cases");
                return tests;
            } catch (e) {
                debugInfo.push(`Error parsing data-test-cases: ${e.message}`);
                console.log("Error parsing data-test-cases attribute:", e);
            }
        }
    }
    
    // Method 3: Parse HTML content from itemcontent if DOM elements not found
    if (instanceObj && instanceObj.itemcontent) {
        debugInfo.push("Parsing itemcontent HTML...");
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = instanceObj.itemcontent;
        
        const problemElementFromContent = tempDiv.querySelector('.problem');
        debugInfo.push(`Found .problem in itemcontent: ${!!problemElementFromContent}`);
        
        if (problemElementFromContent) {
            // Try data-tests from itemcontent
            const testCasesFromContent = problemElementFromContent.getAttribute("data-tests");
            debugInfo.push(`Found data-tests in itemcontent: ${!!testCasesFromContent}`);
            
            if (testCasesFromContent) {
                try {
                    tests = JSON.parse(testCasesFromContent);
                    console.log("✅ Found tests in itemcontent data-tests:", tests.length);
                    statusMessage = `✅ Tests loaded from itemcontent data-tests (${tests.length} tests)`;
                    showEvaluationStatus(itemInstance, statusMessage, tests, debugInfo, "itemcontent-data-tests");
                    return tests;
                } catch (e) {
                    debugInfo.push(`Error parsing itemcontent data-tests: ${e.message}`);
                    console.log("Error parsing itemcontent data-tests:", e);
                }
            }
            
            // Try data-test-cases from itemcontent
            const testCasesSimpleFromContent = problemElementFromContent.getAttribute("data-test-cases");
            debugInfo.push(`Found data-test-cases in itemcontent: ${!!testCasesSimpleFromContent}`);
            
            if (testCasesSimpleFromContent) {
                try {
                    const cases = testCasesSimpleFromContent.split('|');
                    tests = cases.map((testCase, index) => {
                        const [input, expectedOutput] = testCase.split(':');
                        return {
                            id: index + 1,
                            description: `Test ${index + 1}: ${input.trim()}`,
                            test: `result = ${input.trim()}\nassert result == ${expectedOutput.trim()}, f"Expected ${expectedOutput.trim()}, got {result}"`
                        };
                    });
                    console.log("✅ Generated tests from itemcontent data-test-cases:", tests.length);
                    statusMessage = `✅ Tests generated from itemcontent data-test-cases (${tests.length} tests)`;
                    showEvaluationStatus(itemInstance, statusMessage, tests, debugInfo, "itemcontent-data-test-cases");
                    return tests;
                } catch (e) {
                    debugInfo.push(`Error parsing itemcontent data-test-cases: ${e.message}`);
                    console.log("Error parsing itemcontent data-test-cases:", e);
                }
            }
        }
    }
    
    // Method 4: Try to get evaluation data from instanceObj properties
    debugInfo.push("Searching instanceObj properties...");
    if (instanceObj) {
        const searchProperties = ['evaluation', 'evaluations', 'eval', 'tests', 'answer', 'solution', 'content', 'itemcontent', 'data', 'metadata', 'config', 'settings'];
        debugInfo.push(`Searching properties: ${searchProperties.join(', ')}`);
        debugInfo.push(`All instanceObj keys: ${Object.keys(instanceObj).join(', ')}`);
        
        for (const prop of searchProperties) {
            if (instanceObj[prop]) {
                debugInfo.push(`Found data in ${prop} property`);
                console.log(`Found evaluation data in instanceObj.${prop}`);
                let evaluationData;
                
                try {
                    // Parse evaluation data if it's a string
                    if (typeof instanceObj[prop] === 'string') {
                        evaluationData = JSON.parse(instanceObj[prop]);
                    } else {
                        evaluationData = instanceObj[prop];
                    }
                    
                    console.log("Parsed evaluation data:", evaluationData);
                    debugInfo.push(`Parsed evaluation data type: ${typeof evaluationData}`);
                    
                    // Convert EditionMode evaluation format to test format
                    if (Array.isArray(evaluationData)) {
                        tests = evaluationData.map((evaluation, index) => {
                            let testCode = '';
                            
                            // Handle different evaluation types
                            if (evaluation.input && evaluation.output) {
                                // Build test code that runs the input and checks the output
                                const input = evaluation.input.trim();
                                const expectedOutput = evaluation.output.trim();
                                
                                // If input contains function calls, use that directly
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
                                    // Simple variable assignment test
                                    testCode = `
${input}
expected = "${expectedOutput}"
assert str(result).strip() == expected, f"Expected '{expected}', got '{result}'"`;
                                }
                            } else if (evaluation.input) {
                                // Just run the input code and assume it contains assertions
                                testCode = evaluation.input;
                            } else {
                                // Skip malformed evaluations
                                return null;
                            }
                            
                            return {
                                id: index + 1,
                                description: evaluation.commentTrue || `Test ${index + 1}`,
                                test: testCode.trim()
                            };
                        }).filter(test => test !== null); // Remove null tests
                        
                        if (tests.length > 0) {
                            console.log("✅ Converted evaluations to tests:", tests.length);
                            statusMessage = `✅ Tests converted from instanceObj.${prop} (${tests.length} tests)`;
                            showEvaluationStatus(itemInstance, statusMessage, tests, debugInfo, `instanceObj.${prop}`);
                            return tests;
                        }
                    }
                } catch (e) {
                    debugInfo.push(`Error processing ${prop}: ${e.message}`);
                    console.log(`Error processing evaluation data from ${prop}:`, e);
                }
            }
        }
    }
    
    // Method 5: Extract examples from HTML content as fallback
    if (instanceObj && instanceObj.itemcontent && tests.length === 0) {
        debugInfo.push("Attempting to extract examples from HTML content...");
        try {
            const content = instanceObj.itemcontent;
            // Look for patterns like "batuketa(2, 3) → 5"
            const examplePattern = /(\w+)\(([^)]+)\)\s*→\s*([^<\n]+)/g;
            let match;
            const extractedTests = [];
            let testId = 1;
            
            while ((match = examplePattern.exec(content)) !== null) {
                const [fullMatch, functionName, args, expectedResult] = match;
                const testCode = `result = ${functionName}(${args})\nassert result == ${expectedResult.trim()}, f"Expected ${expectedResult.trim()}, got {result}"`;
                
                extractedTests.push({
                    id: testId++,
                    description: `Test: ${functionName}(${args}) → ${expectedResult.trim()}`,
                    test: testCode
                });
                
                debugInfo.push(`Extracted: ${fullMatch}`);
            }
            
            if (extractedTests.length > 0) {
                tests = extractedTests;
                console.log("✅ Extracted tests from HTML examples:", tests.length);
                statusMessage = `✅ Tests extracted from HTML examples (${tests.length} tests)`;
                showEvaluationStatus(itemInstance, statusMessage, tests, debugInfo, "html-examples");
                return tests;
            }
        } catch (e) {
            debugInfo.push(`Error extracting from HTML: ${e.message}`);
            console.log("Error extracting examples from HTML:", e);
        }
    }
    
    // No evaluation data found
    if (tests.length === 0) {
        console.log("⚠️ No evaluation data found, using fallback tests");
        statusMessage = "⚠️ No evaluation data found - tests will not run";
        tests = []; // Return empty array instead of fallback tests
        
        showEvaluationStatus(itemInstance, statusMessage, tests, debugInfo, "none");
    }
    
    console.log("=== getTestsFromEvaluationData END ===", tests.length, "tests");
    return tests;
}

// Function to show evaluation status with debug information
function showEvaluationStatus(itemInstance, statusMessage, tests, debugInfo, source) {
    const instanceID = itemInstance.getAttribute("id");
    let statusDiv = document.getElementById("eval-status-" + instanceID);
    
    if (!statusDiv) {
        statusDiv = document.createElement("div");
        statusDiv.id = "eval-status-" + instanceID;
        statusDiv.className = "evaluation-status";
        
        // Insert after buttons
        const buttonsContainer = itemInstance.querySelector('.python-buttons');
        if (buttonsContainer) {
            buttonsContainer.parentNode.insertBefore(statusDiv, buttonsContainer.nextSibling);
        }
    }
    
    // Create debug toggle button
    const debugToggle = document.createElement("button");
    debugToggle.textContent = "Debug Info";
    debugToggle.style.cssText = "margin-left: 10px; padding: 4px 8px; font-size: 11px; background: #f0f0f0; border: 1px solid #ccc; cursor: pointer;";
    debugToggle.onclick = () => toggleEvaluationDebug(instanceID);
    
    statusDiv.innerHTML = `
        <div style="padding: 8px; background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 4px; margin: 5px 0;">
            <span style="font-weight: bold;">${statusMessage}</span>
        </div>
        <div id="eval-debug-${instanceID}" style="display: none; margin-top: 10px; padding: 8px; background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 4px; font-family: monospace; font-size: 12px;">
            <strong>Debug Information:</strong><br>
            <strong>Source:</strong> ${source}<br><br>
            <strong>Test Count:</strong> ${tests.length}<br><br>
            <strong>Debug Log:</strong><br>
            ${debugInfo.map(info => `• ${info}`).join('<br>')}<br><br>
            <strong>Tests:</strong><br>
            ${JSON.stringify(tests, null, 2)}<br><br>
            <strong>Raw instanceObj:</strong><br>
            ${JSON.stringify(itemInstance._instanceObj, null, 2)}
        </div>
    `;
    
    statusDiv.appendChild(debugToggle);
}

// Function to toggle debug information visibility
function toggleEvaluationDebug(instanceID) {
    const debugDiv = document.getElementById("eval-debug-" + instanceID);
    if (debugDiv) {
        debugDiv.style.display = debugDiv.style.display === "none" ? "block" : "none";
    }
}
