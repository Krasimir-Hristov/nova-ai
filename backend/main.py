"""FastAPI server for Nova AI backend."""

from fastapi import FastAPI

app = FastAPI()


@app.get("/")
def read_root():
    """Root endpoint that returns a greeting."""
    return {"Hello": "World"}
