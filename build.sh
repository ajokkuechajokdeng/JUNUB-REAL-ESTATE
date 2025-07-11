#!/usr/bin/env bash
set -o errexit  # Exit on error

# Install dependencies from project root
pip install -r requirements.txt

# Move into Backend folder where manage.py is
cd Backend

# Collect static files
python manage.py collectstatic --no-input

# Apply migrations
python manage.py migrate
