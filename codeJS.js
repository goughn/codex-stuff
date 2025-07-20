var pyodideReadyPromise = loadPyodide();
console.log("type 106 github v4.7");
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

    // DEBUGGING: Log initial state of answer element
    console.log("=== ANSWER ELEMENT INITIAL STATE ===");
    console.log("answerElement.value:", answerElement.value);
    console.log("answerElement.innerHTML:", answerElement.innerHTML);
    console.log("answerElement.textContent:", answerElement.textContent);
    
    // Store initial content before clearing
    const initialContent = answerElement.value.trim();
    const initialInnerHTML = answerElement.innerHTML.trim();
    
    // Clear any pre-filled content that might come from data-demo or other sources
    // Force clear both value and innerHTML to ensure clean start
    console.log("Clearing answer element to ensure clean start...");
    answerElement.value = "";
    answerElement.innerHTML = "";
    answerElement.textContent = "";
    
    // Handle existing answer (only if there was a legitimate saved answer)
    if (initialContent !== "" && initialContent.startsWith("{")) {
        try {
            const resp = JSON.parse(initialContent);
            answerElement.value = resp.code;
            console.log("Restored previous saved answer:", {
                codeLength: resp.code.length,
                outputLength: resp.output?.length
            });
        } catch (e) {
            console.log("Error parsing saved answer, keeping clean:", e);
            answerElement.value = "";
        }
    } else if (initialContent !== "" || initialInnerHTML !== "") {
        console.log("Found non-JSON content, clearing:", {
            value: initialContent.substring(0, 100),
            innerHTML: initialInnerHTML.substring(0, 100)
        });
        answerElement.value = "";
    }
    
    console.log("Final answer element state:", answerElement.value);
    
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
            
            // Show evaluation status for debugging
            showEvaluationStatus(itemInstance, 
                tests.length > 0 ? "instanceObj-evaluation" : "none", 
                tests.length, 
                tests, 
                itemInstance._instanceObj, 
                {
                    searchedProperties: ['evaluation', 'data-tests', 'data-test-cases'],
                    foundData: tests.length > 0 ? {property: 'evaluation', data: tests} : null,
                    errors: []
                }
            );
            
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
    
    // First, try to get from instanceObj.evaluation (EditionMode format)
    if (instanceObj && instanceObj.evaluation) {
        console.log("🔍 Found instanceObj.evaluation - EditionMode format");
        try {
            let evaluationData;
            if (typeof instanceObj.evaluation === 'string') {
                evaluationData = JSON.parse(instanceObj.evaluation);
            } else {
                evaluationData = instanceObj.evaluation;
            }
            
            if (Array.isArray(evaluationData) && evaluationData.length > 0) {
                console.log("📋 Processing EditionMode evaluations:", evaluationData.length);
                
                tests = evaluationData.map((evaluation, index) => {
                    const input = evaluation.input ? evaluation.input.trim() : '';
                    const expectedOutput = evaluation.output || evaluation.returnValue || '';
                    const mark = evaluation.mark || 1;
                    
                    if (!input) {
                        console.warn(`Evaluation ${index + 1} has no input, skipping`);
                        return null;
                    }
                    
                    // Create test code based on evaluation type
                    let testCode = '';
                    if (evaluation.type === 'output') {
                        // For output-based tests
                        testCode = `
${input}
import sys
from io import StringIO
captured_output = StringIO()
sys.stdout = captured_output
exec("""${input.replace(/"/g, '\\"')}""")
output = captured_output.getvalue().strip()
sys.stdout = sys.__stdout__
expected = "${expectedOutput.replace(/"/g, '\\"')}"
assert output == expected, f"Expected '{expected}', got '{output}'"`;
                    } else {
                        // For return-based tests (default)
                        if (input.includes('(') && input.includes(')')) {
                            // Function call test
                            const isNumeric = !isNaN(parseFloat(expectedOutput)) && isFinite(expectedOutput);
                            const expectedValue = isNumeric ? expectedOutput : `"${expectedOutput}"`;
                            testCode = `
result = ${input}
expected = ${expectedValue}
if isinstance(result, (int, float)) and isinstance(expected, (int, float)):
    assert result == expected, f"Expected {expected}, got {result}"
else:
    assert str(result) == str(expected), f"Expected '{expected}', got '{result}'"`;
                        } else {
                            // Code execution test
                            const isNumeric = !isNaN(parseFloat(expectedOutput)) && isFinite(expectedOutput);
                            const expectedValue = isNumeric ? expectedOutput : `"${expectedOutput}"`;
                            testCode = `
${input}
expected = ${expectedValue}
if 'result' in locals():
    if isinstance(result, (int, float)) and isinstance(expected, (int, float)):
        assert result == expected, f"Expected {expected}, got {result}"
    else:
        assert str(result) == str(expected), f"Expected '{expected}', got '{result}'"
else:
    raise AssertionError("No result variable found after executing code")`;
                        }
                    }
                    
                    return {
                        id: index + 1,
                        description: evaluation.commentTrue || `Test ${index + 1}: ${input} → ${expectedOutput}`,
                        test: testCode.trim(),
                        mark: mark,
                        commentTrue: evaluation.commentTrue,
                        commentFalse: evaluation.commentFalse
                    };
                }).filter(test => test !== null);
                
                if (tests.length > 0) {
                    evaluationSource = "instanceObj-evaluation";
                    console.log(`✅ Successfully converted ${tests.length} EditionMode evaluations`);
                    return tests;
                }
            }
        } catch (e) {
            console.log("❌ Error processing instanceObj.evaluation:", e);
            debugInfo.errors.push("Error processing instanceObj.evaluation: " + e.message);
        }
    }

    // Then try data-tests attribute (existing method)
    const problemElement = itemInstance.querySelector(".problem");
    if (problemElement) {
        const testCases = problemElement.getAttribute("data-tests");
        if (testCases) {
            try {
                tests = JSON.parse(testCases);
                evaluationSource = "data-tests";
                console.log("Found tests in data-tests attribute:", tests.length);
                return tests;
            } catch (e) {
                console.log("Error parsing data-tests attribute:", e);
                debugInfo.errors.push("Error parsing data-tests: " + e.message);
            }
        }
        
        // Try to get from data-test-cases attribute (new simple format)
        const testCasesSimple = problemElement.getAttribute("data-test-cases");
        if (testCasesSimple) {
            console.log("🔍 Found data-test-cases attribute");
            
            try {
                // Parse format: "function(args):result|function(args):result|..."
                const testPairs = testCasesSimple.split('|');
                
                tests = testPairs.map((pair, index) => {
                    const [functionCall, expectedResult] = pair.split(':');
                    
                    if (functionCall && expectedResult !== undefined) {
                        return {
                            id: index + 1,
                            description: `Test ${functionCall.trim()}`,
                            test: `result = ${functionCall.trim()}\nassert result == ${expectedResult.trim()}, f"Expected ${expectedResult.trim()}, got {result}"`
                        };
                    }
                    return null;
                }).filter(test => test !== null);
                
                if (tests.length > 0) {
                    evaluationSource = "data-test-cases";
                    console.log(`Generated ${tests.length} tests from data-test-cases`);
                    return tests;
                }
            } catch (e) {
                console.log("Error processing data-test-cases:", e);
                debugInfo.errors.push("Error processing data-test-cases: " + e.message);
            }
        }
    }
    
    // Try parsing HTML content from itemcontent if DOM elements not found
    if (instanceObj && instanceObj.itemcontent) {
        console.log("🔍 Parsing itemcontent HTML...");
        try {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = instanceObj.itemcontent;
            
            const problemElementFromContent = tempDiv.querySelector('.problem');
            if (problemElementFromContent) {
                console.log("Found .problem element in itemcontent HTML");
                
                // Try data-tests from itemcontent
                const testCasesFromContent = problemElementFromContent.getAttribute("data-tests");
                if (testCasesFromContent) {
                    try {
                        tests = JSON.parse(testCasesFromContent);
                        evaluationSource = "itemcontent-data-tests";
                        console.log("Found tests in itemcontent data-tests:", tests.length);
                        return tests;
                    } catch (e) {
                        console.log("Error parsing itemcontent data-tests:", e);
                        debugInfo.errors.push("Error parsing itemcontent data-tests: " + e.message);
                    }
                }
                
                // Try data-test-cases from itemcontent
                const testCasesSimpleFromContent = problemElementFromContent.getAttribute("data-test-cases");
                if (testCasesSimpleFromContent) {
                    try {
                        const testPairs = testCasesSimpleFromContent.split('|');
                        tests = testPairs.map((pair, index) => {
                            const [functionCall, expectedResult] = pair.split(':');
                            if (functionCall && expectedResult !== undefined) {
                                return {
                                    id: index + 1,
                                    description: `Test ${functionCall.trim()}`,
                                    test: `result = ${functionCall.trim()}\nassert result == ${expectedResult.trim()}, f"Expected ${expectedResult.trim()}, got {result}"`
                                };
                            }
                            return null;
                        }).filter(test => test !== null);
                        
                        if (tests.length > 0) {
                            evaluationSource = "itemcontent-data-test-cases";
                            console.log(`Generated ${tests.length} tests from itemcontent data-test-cases`);
                            return tests;
                        }
                    } catch (e) {
                        console.log("Error parsing itemcontent data-test-cases:", e);
                        debugInfo.errors.push("Error parsing itemcontent data-test-cases: " + e.message);
                    }
                }
            } else {
                console.log("No .problem element found in itemcontent HTML");
            }
        } catch (e) {
            console.log("Error parsing itemcontent HTML:", e);
            debugInfo.errors.push("Error parsing itemcontent HTML: " + e.message);
        }
    }
    
    // Extract examples from HTML content as fallback
    if (instanceObj && instanceObj.itemcontent && tests.length === 0) {
        console.log("🔍 Attempting to extract examples from HTML content...");
        try {
            const content = instanceObj.itemcontent;
            // Look for patterns like "batuketa(2, 3) → 5"
            const examplePattern = /(\w+)\(([^)]+)\)\s*→\s*([^<\n\r]+)/g;
            let match;
            const extractedTests = [];
            let testId = 1;
            
            while ((match = examplePattern.exec(content)) !== null) {
                const [fullMatch, functionName, args, expectedResult] = match;
                const cleanResult = expectedResult.trim().replace(/[<>]/g, '');
                const testCode = `result = ${functionName}(${args})\nassert result == ${cleanResult}, f"Expected ${cleanResult}, got {result}"`;
                
                extractedTests.push({
                    id: testId++,
                    description: `Test: ${functionName}(${args}) → ${cleanResult}`,
                    test: testCode
                });
                
                console.log(`Extracted: ${functionName}(${args}) → ${cleanResult}`);
            }
            
            if (extractedTests.length > 0) {
                tests = extractedTests;
                evaluationSource = "html-examples";
                console.log("Extracted tests from HTML examples:", tests.length);
                return tests;
            } else {
                console.log("No example patterns found in HTML content");
            }
        } catch (e) {
            console.log("Error extracting examples from HTML:", e);
            debugInfo.errors.push("Error extracting from HTML: " + e.message);
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
                        console.log(`Parsed JSON from '${prop}':`, evaluationData);
                    } else {
                        console.log(`String content in '${prop}':`, instanceObj[prop]);
                        continue;
                    }
                } else if (typeof instanceObj[prop] === 'object') {
                    evaluationData = instanceObj[prop];
                    console.log(`Object in '${prop}':`, evaluationData);
                }
                
                // Check if this looks like evaluation data
                if (evaluationData && Array.isArray(evaluationData)) {
                    console.log(`Found array in '${prop}' with ${evaluationData.length} items`);
                    
                    // Check if array items look like evaluation objects
                    const hasEvalStructure = evaluationData.some(item => 
                        item && (item.input || item.test || item.output || item.mark)
                    );
                    
                    if (hasEvalStructure) {
                        console.log(`Array in '${prop}' looks like evaluation data!`);
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
                            console.log(`Successfully converted ${tests.length} tests from '${prop}'`);
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
                console.log(`Error processing '${prop}':`, e);
                debugInfo.errors.push(`Error processing ${prop}: ${e.message}`);
            }
        } else {
            console.log(`Property '${prop}' not found or empty`);
        }
    }
    
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
        statusText = `Tests converted from instanceObj.${propertyName} (${testCount} tests)`;
        statusClass = "status-success";
    } else {
        switch(source) {
            case "instanceObj-evaluation":
                statusText = `Tests loaded from EditionMode evaluation data (${testCount} tests)`;
                statusClass = "status-success";
                break;
            case "data-tests":
                statusText = `Tests loaded from data-tests attribute (${testCount} tests)`;
                statusClass = "status-success";
                break;
            case "data-test-cases":
                statusText = `Tests generated from data-test-cases attribute (${testCount} tests)`;
                statusClass = "status-success";
                break;
            case "itemcontent-data-tests":
                statusText = `Tests loaded from itemcontent data-tests (${testCount} tests)`;
                statusClass = "status-success";
                break;
            case "itemcontent-data-test-cases":
                statusText = `Tests generated from itemcontent data-test-cases (${testCount} tests)`;
                statusClass = "status-success";
                break;
            case "html-examples":
                statusText = `Tests extracted from HTML examples (${testCount} tests)`;
                statusClass = "status-success";
                break;
            case "instanceObj":
                statusText = `Tests converted from evaluation data (${testCount} tests)`;
                statusClass = "status-success";
                break;
            case "error":
                statusText = `Error processing evaluation data`;
                statusClass = "status-error";
                break;
            case "none":
            default:
                statusText = `No evaluation data found - tests will not run`;
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

function displayMarksForSend(itemInstance, totalMarks, maxPossibleMarks) {
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
    const percentage = Math.round((totalMarks / maxPossibleMarks) * 100);
    marksDiv.innerHTML = `
        <div>✅ <strong>Evaluation Complete!</strong></div>
        <div>Score: <strong>${totalMarks}/${maxPossibleMarks}</strong> marks (${percentage}%)</div>
    `;
    
    console.log(`Marks displayed: ${totalMarks}/${maxPossibleMarks} (${percentage}%)`);
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
        const { totalMarks, totalTests, maxPossibleMarks } = itemInstance._testResults;
        respObject.marks = totalMarks;
        respObject.totalTests = totalTests;
        respObject.maxPossibleMarks = maxPossibleMarks;
        respObject.percentage = Math.round((totalMarks / maxPossibleMarks) * 100);
        respObject.evaluationCompleted = true;
        
        // Display marks immediately when Send is clicked
        displayMarksForSend(itemInstance, totalMarks, maxPossibleMarks);
    } else {
        // No tests run yet
        respObject.evaluationCompleted = false;
        respObject.message = "Tests not run - click 'Run Tests' first for evaluation";
    }
    
    // Don't modify the textarea - saveSendAnswer calls this function directly
    // and uses the return value. The textarea should only contain user's code.
    console.log("Returning evaluation data:", respObject);
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
    let maxPossibleMarks = 0;
    
    // Set up stdout/stderr redirection for first test only
    pyodide.setStdout({
        batched: (s) => outputDiv.textContent += s,
    });
    pyodide.setStderr({
        batched: (s) => outputDiv.textContent += s,
    });
    
    try {
        // Calculate total possible marks
        maxPossibleMarks = tests.reduce((sum, test) => sum + (test.mark || 1), 0);
        
        // Run first test immediately
        let firstTestPassed = false;
        const firstTestMark = tests[0].mark || 1;
        try {
            await pyodide.runPythonAsync(pyCode);
            await pyodide.runPythonAsync(tests[0].test);
            totalMarks += firstTestMark;
            firstTestPassed = true;
        } catch (error) {
            outputDiv.textContent += `\n${error}`;
        }
        // Show initial marks after first test
        marksDiv.textContent = `Marks ${totalMarks}/${maxPossibleMarks}`;
        
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
                const testMark = test.mark || 1;
                try {
                    await pyodide.runPythonAsync(pyCode);
                    await pyodide.runPythonAsync(test.test);
                    totalMarks += testMark;
                } catch (error) {
                    // Do not update outputDiv, just ignore or log
                    console.log(`Test ${test.id} failed:`, error);
                }
                // Update marksDiv after each test
                marksDiv.textContent = `Marks ${totalMarks}/${maxPossibleMarks}`;
            }
        }
    } catch (error) {
        outputDiv.textContent += `\nError running tests: ${error}`;
    }
    
    // Store test results for Send button
    itemInstance._testResults = {
        totalMarks: totalMarks,
        totalTests: tests.length,
        maxPossibleMarks: maxPossibleMarks,
        testsRun: true
    };
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
