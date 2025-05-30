#!/usr/bin/env python3
"""
Script to create/recreate database tables with the correct schema
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import engine, Base
from app.models import Transcript, Speaker
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def recreate_tables():
    """Drop and recreate all tables"""
    try:
        logger.info("Dropping existing tables...")
        Base.metadata.drop_all(bind=engine)
        
        logger.info("Creating new tables with updated schema...")
        Base.metadata.create_all(bind=engine)
        
        logger.info("Tables created successfully!")
        logger.info("Available tables:")
        for table_name in Base.metadata.tables.keys():
            logger.info(f"  - {table_name}")
            
    except Exception as e:
        logger.error(f"Error creating tables: {e}")
        raise

if __name__ == "__main__":
    recreate_tables() 