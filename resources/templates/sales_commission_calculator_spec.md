# Sales Commission Calculator Template Specification

## Overview
This template provides a comprehensive sales commission calculator for practicing Excel formulas and functions. It allows users to calculate commissions based on different sales scenarios, tiers, and bonus structures.

## Worksheets

### 1. Dashboard
- **Purpose**: Overview of sales performance and commission earnings
- **Content**:
  - Total sales summary
  - Commission summary
  - Top performers chart
  - Monthly/quarterly trends
  - Goal achievement indicators
  - YTD commission vs. targets

### 2. Commission Calculator
- **Purpose**: Main worksheet for calculating individual sales commissions
- **Content**:
  - Sales representative information section:
    - Name
    - ID
    - Department/Region
    - Base salary
  - Commission structure section:
    - Commission rate tiers (e.g., 3% for first $10,000, 5% for $10,001-$25,000, 7% for $25,001+)
    - Bonus thresholds
    - Product category multipliers
  - Sales entry section:
    - Product category
    - Sale amount
    - Date of sale
    - Customer information
  - Commission calculations:
    - Basic commission calculation using nested IF functions or VLOOKUP
    - Tier-based calculations using IFS or nested IF statements
    - Bonus calculations for exceeding targets
    - Total commission summary

### 3. Team Overview
- **Purpose**: Compare performance across the sales team
- **Content**:
  - Table with all sales representatives
  - Monthly sales columns
  - Monthly commission columns
  - YTD totals
  - Rankings and performance metrics
  - Team goals and achievement percentages
  - Conditional formatting to highlight top and bottom performers

### 4. Commission Rates
- **Purpose**: Reference table for commission rates and structures
- **Content**:
  - Detailed commission tier tables
  - Product category multipliers
  - Bonus qualification rules
  - Special promotion rates
  - Lookup tables used by formulas in other sheets

### 5. Sales Log
- **Purpose**: Detailed log of all sales transactions
- **Content**:
  - Date
  - Sales rep
  - Customer
  - Product category
  - Sale amount
  - Commission earned
  - Running totals
  - Filtering capabilities

### 6. Instructions
- **Purpose**: Guide on using the template and understanding the formulas
- **Content**:
  - Step-by-step instructions
  - Formula explanations
  - Examples of different scenarios
  - Tips for customization
  - Practice exercises

## Excel Features to Include
- VLOOKUP and HLOOKUP functions
- INDEX and MATCH functions
- Nested IF statements
- IFS function (for newer Excel versions)
- SUMIF and COUNTIF functions
- Date functions (MONTH, YEAR, TODAY)
- Data validation for dropdown lists
- Named ranges
- PivotTables for analysis
- Charts for visualization
- Conditional formatting
- Data tables for what-if analysis
- Form controls (optional)

## Formula Examples to Include
- Tiered commission calculation:
  ```
  =IF(B2<=10000, B2*0.03, IF(B2<=25000, 10000*0.03+(B2-10000)*0.05, 10000*0.03+15000*0.05+(B2-25000)*0.07))
  ```

- Commission with product multiplier:
  ```
  =VLOOKUP(C3, CommissionTiers, 2, TRUE) * VLOOKUP(D3, ProductMultipliers, 2, FALSE) * B3
  ```

- Bonus calculation:
  ```
  =IF(SUM(SalesRange)>QuarterlyTarget, SUM(SalesRange)*BonusRate, 0)
  ```

- Team ranking:
  ```
  =RANK.EQ(G5, $G$5:$G$20, 0)
  ```

- Year-to-date calculation:
  ```
  =SUMIFS(SalesAmount, SalesDate, ">="&DATE(YEAR(TODAY()),1,1), SalesDate, "<="&TODAY(), SalesRep, RepName)
  ```

## Design Elements
- Professional color scheme
- Clear section headers
- Proper currency and percentage formatting
- Protected formula cells
- Intuitive navigation between sheets
- Print-ready layouts
- Consistent styling throughout

## Practice Opportunities
The template should allow users to practice:
- Complex nested functions
- Lookup functions
- Conditional calculations
- Working with dates
- Creating dynamic reports
- Data analysis techniques
- What-if scenarios
- Advanced charting
