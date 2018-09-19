# 2.0.0

## Breaking changes

- Switches to a single default export - before, it was necessary to configure babel to use `createElement`, and import the export of the same name from jsx-pdf. Now, babel should be configured to use `JsxPdf.createElement`, and the whole package should be imported. See the readme for more details and examples.
- Changes the integration point of the package. Previously pdfmake was a dependency, and the library handled creating the PDFKit document internally. However, this limits the ability of consumers to configure pdfmake in the way that they need to. We also only supported rendering PDFs in node, but pdfmake can actually render PDFs in a browser too. Now, we provide a renderPdf function that outputs the correct pdfmake format, and consumers need to handle importing pdfmake and passing the result of renderPdf to it.

# 1.0.0

- First semver release 🎉
