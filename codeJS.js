var pyodideReadyPromise = loadPyodide();
console.log("type 106 github v3.5");
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

// Function to convert EditionMode evaluation data to test format
function getTestsFromEvaluationData(itemInstance) {
    console.log("=== getTestsFromEvaluationData START ===");
    
    const instanceObj = itemInstance._instanceObj;
    let tests = [];
    
    // First, try to get from data-tests attribute (existing method)
    const problemElement = itemInstance.querySelector(".problem");
    if (problemElement) {
        const testCases = problemElement.getAttribute("data-tests");
        if (testCases) {
            try {
                tests = JSON.parse(testCases);
                console.log("Found tests in data-tests attribute:", tests.length);
                return tests;
            } catch (e) {
                console.log("Error parsing data-tests attribute:", e);
            }
        }
    }
    
    // Try to get evaluation data from instanceObj
    if (instanceObj && instanceObj.evaluation) {
        console.log("Found evaluation data in instanceObj");
        let evaluationData;
        
        try {
            // Parse evaluation data if it's a string
            if (typeof instanceObj.evaluation === 'string') {
                evaluationData = JSON.parse(instanceObj.evaluation);
            } else {
                evaluationData = instanceObj.evaluation;
            }
            
            console.log("Parsed evaluation data:", evaluationData);
            
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
                
                console.log("Converted evaluations to tests:", tests.length);
            }
        } catch (e) {
            console.log("Error processing evaluation data:", e);
        }
    }
    
    // Fallback to hardcoded tests if no evaluation data found
    if (tests.length === 0) {
        console.log("No evaluation data found, using fallback tests");
        tests = [
            {id: 1, description: "Sum of 2 and 3", test: "result = sum(2, 3)\nassert result == 5, f'Expected 5, got {result}'"},
            {id: 2, description: "Sum of 0 and 0", test: "result = sum(0, 0)\nassert result == 0, f'Expected 0, got {result}'"},
            {id: 3, description: "Sum of -1 and 1", test: "result = sum(-1, 1)\nassert result == 0, f'Expected 0, got {result}'"},
            {id: 4, description: "Sum of 10 and 15", test: "result = sum(10, 15)\nassert result == 25, f'Expected 25, got {result}'"}
        ];
    }
    
    console.log("=== getTestsFromEvaluationData END ===", tests.length, "tests");
    return tests;
}
