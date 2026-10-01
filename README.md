## Code Inspector
​A lightweight, high-performance static code analysis and linting platform designed to inspect, validate, and format source code across four core web and backend languages:
* **Python**
* **​JavaScript**
* **​CSS**
* **​HTML**
## ​Project Purpose
​**Code Inspector** unifies multiple static analysis tools, security scanners, and code formatters into a single cohesive web interface and RESTful API. Hosted on PythonAnywhere, it helps developers detect syntax errors, enforce style guidelines, catch security vulnerabilities, and reformat code before production deployment.
## ​Features & Capabilities
### ​Direct Code Inspection: Analyze code snippets in real-time directly from the editor.
​Raw URL Inspection: Fetch and inspect source files directly from GitHub raw links or external URLs.
### ​Automated Code Formatting: Instant code cleanup and standardization across supported languages.
### ​Unified Diagnostic Engine: Standardized JSON response across all backend linters for consistent error reporting.
## ​Integrated Tools & Engines
### ​JavaScript:
​* **ESLint:** Modern static analysis using Flat Configuration (eslint.config.mjs) to detect syntax errors, code smells, and scope bugs.
​### Python:
​* **Python AST:** Syntax tree verification and structural parsing.
* **​PyCodeStyle:** PEP 8 style guide compliance checking.
* **​PyFlakes:** Fast logical error detection without importing modules.
​* **Bandit:** Security linter to identify common security vulnerabilities.
### ​HTML:
​* **HTML-Validate:** DOM structure validation, tag matching, and HTML standard compliance checking.
​### CSS:
* **​Stylelint:** Modern CSS syntax validation and style rule enforcement.
​## Code Formatting:
* **​Prettier / Black Integration:** Automated code formatting and layout alignment.
## ​API Output Schema
​The backend Flask API returns a standardized JSON diagnostic report for every inspection request:
"""
{
  "tool": "ESLint",
  "is_valid": false,
  "total_issues": 2,
  "issues": [
    {
      "line": 5,
      "column": 12,
      "severity": "warning",
      "message": "This line has a length of 120. Maximum allowed is 100.",
      "rule_id": "max-len"
    },
    {
      "line": 14,
      "column": 3,
      "severity": "error",
      "message": "'document' is not defined.",
      "rule_id": "no-undef"
    }
  ]
}
"""
## Report Fields
* **​Inspection Metadata:** Identifies the executed inspector (tool) and target language.
* **​Code Health (is_valid):** A boolean flag (true/false) indicating if the code passed inspection without critical errors.
* **​Total Issues (total_issues):** Count of all errors and warnings detected in the file.
​Diagnostics Array (issues): Itemized list containing:
* **​Location:** Precise line and column numbers.
* **​Severity:** Categorized as error or warning.
* **​Message:** Clear descriptive text explaining the issue.
* **​Rule ID:** The specific linter rule identifier for easy reference and debugging.
