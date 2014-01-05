Turtl for Firefox
=================
Please note that this project is not officially maintained, and will not be
until Firefox has extension sandboxing.

Setup
-----
Create a symlink from `data/app/` -> `/path/to/turtl-js`.

Packaging
---------
To build/package the extension, just run the `package` script from the root
directory:

```bash
cd /path/to/turtl/firefox
./scripts/package
```

This builds an xpi file in the `release/` directory.

