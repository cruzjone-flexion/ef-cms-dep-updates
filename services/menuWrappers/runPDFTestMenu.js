function runPDFTestMenu(runPDFTest) {
  return {
    title: "Run PDF Tests",
    method: runPDFTest,
    description: "Verify that PDF's still pass by running tests",
  };
}

module.exports = runPDFTestMenu;
