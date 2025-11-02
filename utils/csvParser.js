import csv from "csv-parser";
import { Readable } from "stream";

/**
 * Parse CSV file buffer and validate data
 * @param {Buffer} fileBuffer - The CSV file buffer
 * @param {Array} requiredColumns - Array of required column names
 * @returns {Promise<Array>} - Parsed and validated CSV data
 */
export const parseCSV = (
  fileBuffer,
  requiredColumns = ["zone_name", "pincode"]
) => {
  return new Promise((resolve, reject) => {
    const results = [];
    const errors = [];

    // Convert buffer to readable stream
    const readable = Readable.from(fileBuffer);

    readable
      .pipe(
        csv({
          skipEmptyLines: true,
          trim: true,
          headers: true,
        })
      )
      .on("data", (row, index) => {
        try {
          // Validate required columns exist
          const missingColumns = requiredColumns.filter(
            (col) => !row[col] || row[col].trim() === ""
          );

          if (missingColumns.length > 0) {
            errors.push({
              row: index + 2, // +2 because csv-parser is 0-indexed and we have headers
              error: `Missing required columns: ${missingColumns.join(", ")}`,
              data: row,
            });
            return;
          }

          // Validate pincode format (should be 6 digits)
          const pincode = row.pincode.toString().trim();
          if (!/^\d{6}$/.test(pincode)) {
            errors.push({
              row: index + 2,
              error: `Invalid pincode format: ${pincode}. Should be 6 digits.`,
              data: row,
            });
            return;
          }

          // Clean and format the data
          const cleanedRow = {
            zone_name: row.zone_name.toString().trim(),
            pincode: pincode,
            city: row.city ? row.city.toString().trim() : null,
            state: row.state ? row.state.toString().trim() : null,
          };

          results.push(cleanedRow);
        } catch (error) {
          errors.push({
            row: index + 2,
            error: `Row parsing error: ${error.message}`,
            data: row,
          });
        }
      })
      .on("end", () => {
        resolve({
          data: results,
          errors: errors,
          totalRows: results.length + errors.length,
          validRows: results.length,
          errorRows: errors.length,
        });
      })
      .on("error", (error) => {
        reject(new Error(`CSV parsing failed: ${error.message}`));
      });
  });
};

/**
 * Validate zone names for database insertion
 * @param {Array} zones - Array of zone names
 * @returns {Object} - Validation result
 */
export const validateZoneNames = (zones) => {
  const errors = [];
  const validZones = [];

  zones.forEach((zoneName) => {
    // Check length
    if (zoneName.length > 100) {
      errors.push(`Zone name too long: ${zoneName.substring(0, 50)}...`);
      return;
    }

    // Check for valid characters (alphanumeric, spaces, hyphens, underscores)
    if (!/^[a-zA-Z0-9\s\-_]+$/.test(zoneName)) {
      errors.push(`Invalid characters in zone name: ${zoneName}`);
      return;
    }

    // Check for reserved names
    const reservedNames = ["nationwide", "all", "global", "admin", "system"];
    if (reservedNames.includes(zoneName.toLowerCase())) {
      errors.push(`Reserved zone name not allowed: ${zoneName}`);
      return;
    }

    validZones.push(zoneName);
  });

  return {
    validZones,
    errors,
    isValid: errors.length === 0,
  };
};

/**
 * Group CSV data by zones
 * @param {Array} csvData - Parsed CSV data
 * @returns {Object} - Data grouped by zones
 */
export const groupByZones = (csvData) => {
  const zoneGroups = {};

  csvData.forEach((row) => {
    if (!zoneGroups[row.zone_name]) {
      zoneGroups[row.zone_name] = [];
    }

    zoneGroups[row.zone_name].push({
      pincode: row.pincode,
      city: row.city,
      state: row.state,
    });
  });

  return zoneGroups;
};

/**
 * Validate file type and size
 * @param {Object} file - Multer file object
 * @returns {Object} - Validation result
 */
export const validateFile = (file) => {
  const errors = [];

  // Check file exists
  if (!file) {
    errors.push("No file uploaded");
    return { isValid: false, errors };
  }

  // Check file type
  const allowedMimes = [
    "text/csv",
    "application/csv",
    "application/vnd.ms-excel",
  ];
  const allowedExtensions = [".csv"];

  const hasValidMime = allowedMimes.includes(file.mimetype);
  const hasValidExtension = allowedExtensions.some((ext) =>
    file.originalname.toLowerCase().endsWith(ext)
  );

  if (!hasValidMime && !hasValidExtension) {
    errors.push("Invalid file type. Only CSV files are allowed.");
  }

  // Check file size (max 10MB)
  const maxSize = 10 * 1024 * 1024; // 10MB in bytes
  if (file.size > maxSize) {
    errors.push("File too large. Maximum size allowed is 10MB.");
  }

  // Check if file is empty
  if (file.size === 0) {
    errors.push("File is empty.");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Generate sample CSV content for download
 * @returns {string} - CSV content string
 */
export const generateSampleCSV = () => {
  const sampleData = [
    ["zone_name", "pincode", "city", "state"],
    ["DelhiZone", "110001", "New Delhi", "Delhi"],
    ["DelhiZone", "110002", "Delhi Cantt", "Delhi"],
    ["DelhiZone", "122001", "Gurgaon", "Haryana"],
    ["MumbaiZone", "400001", "Fort Mumbai", "Maharashtra"],
    ["MumbaiZone", "400002", "Kalbadevi", "Maharashtra"],
    ["ChennaiZone", "600001", "Chennai GPO", "Tamil Nadu"],
    ["BangaloreZone", "560001", "Bangalore GPO", "Karnataka"],
  ];

  return sampleData.map((row) => row.join(",")).join("\n");
};

export default {
  parseCSV,
  validateZoneNames,
  groupByZones,
  validateFile,
  generateSampleCSV,
};
