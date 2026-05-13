import sys
import os

# Add the parent directory to sys.path so we can import the main app
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from main import app
from mangum import Mangum

handler = Mangum(app)
