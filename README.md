# Smart Reconciliation Visualizer

An interactive dashboard that helps users reconcile two financial datasets by comparing purchase registers, sales registers, or any two financial datasets. The application identifies matches, mismatches, and missing entries with a clear visual representation.

## Features

-  **Dual Dataset Upload**: Upload two financial datasets in CSV or Excel format
-  **Smart Matching**: Intelligent algorithm that matches records based on multiple criteria (ID, reference, date, amount, description)
-  **Match Detection**: Identifies records that match between both datasets
-  **Mismatch Detection**: Finds records that are similar but have differences
-  **Missing Records**: Identifies records present in one dataset but not the other
-  **Visual Analytics**: Interactive charts and graphs showing reconciliation statistics
-  **Search & Filter**: Search through results and filter matches by confidence level
-  **Modern UI**: Beautiful, responsive design with excellent user experience

## Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **File Parsing**: PapaParse (CSV), XLSX (Excel)
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone https://github.com/saurabhiiitm062/Smart-Reconciliation-Visualizer
cd smart-reconciliation-visualizer
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Run the development server:
```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production

```bash
npm run build
npm start
```

## How to Use

1. **Upload Datasets**: 
   - Click on "Dataset 1" and upload your first financial dataset (e.g., Purchase Register)
   - Click on "Dataset 2" and upload your second financial dataset (e.g., Sales Register)
   - Supported formats: CSV (.csv), Excel (.xlsx, .xls)
   - Sample datasets are available in the `public/` folder for testing

2. **Reconcile**:
   - Once both datasets are uploaded, click the "Reconcile Datasets" button
   - The system will analyze and compare the datasets

3. **View Results**:
   - **Summary Cards**: Quick overview of matches, mismatches, and missing records
   - **Charts**: Visual representation of the reconciliation results
   - **Detailed Tables**: Expandable rows showing full record details
   - **Search**: Use the search bar to find specific records
   - **Filter**: For matches, adjust the confidence threshold slider

4. **Analyze**:
   - Click on any result row to expand and see full details
   - Review differences in mismatched records
   - Identify missing records that need attention

## Technical Approach

### Matching Algorithm

The reconciliation algorithm uses a multi-criteria matching approach:

1. **Field Mapping**: Automatically identifies common fields (ID, reference, date, amount, description, category)
2. **Similarity Calculation**: Uses string similarity and exact matching for numeric values
3. **Confidence Scoring**: Calculates a confidence score based on field matches
4. **Priority Fields**: Prioritizes ID and reference fields for matching
5. **Threshold-Based Matching**: Records are considered matched if:
   - Confidence score ≥ 80%, OR
   - Key fields (ID/reference) match + at least one other field matches

### Data Structure

The application expects financial records with common fields such as:
- `id` or `reference`: Unique identifier
- `date`: Transaction date
- `amount`: Transaction amount
- `description`: Transaction description
- `category`: Transaction category
- Any additional custom fields

The parser automatically maps common field variations (e.g., "Amount", "Value", "Price" → `amount`).

### Reconciliation Results

Results are categorized into:
- **Matches**: Records that match between both datasets (confidence ≥ threshold)
- **Mismatches**: Records that are similar but have differences in some fields
- **Missing in Dataset 1**: Records present in Dataset 2 but not in Dataset 1
- **Missing in Dataset 2**: Records present in Dataset 1 but not in Dataset 2

## Assumptions

1. **File Format**: Datasets are expected to be in CSV or Excel format with headers
2. **Field Flexibility**: The system can handle datasets with different field names by attempting to map common variations
3. **Data Types**: Amounts are expected to be numeric; dates can be in various formats
4. **Matching Logic**: The algorithm prioritizes exact matches but can handle slight variations (typos, formatting differences)
5. **Browser Support**: Modern browsers with ES6+ support

## Project Structure

```
smart-reconciliation-visualizer/
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx             # Main page component
│   └── globals.css          # Global styles
├── components/
│   ├── FileUpload.tsx       # File upload component
│   ├── ReconciliationResults.tsx  # Results visualization
│   └── ResultsTable.tsx     # Detailed results table
├── lib/
│   ├── fileParser.ts        # CSV/Excel parsing logic
│   └── reconciliation.ts    # Core reconciliation algorithm
├── types/
│   └── index.ts             # TypeScript type definitions
└── README.md
```

## Future Enhancements

- Export reconciliation results to CSV/Excel
- Support for more file formats (JSON, XML)
- Advanced matching rules configuration
- Batch processing for large datasets
- Historical reconciliation tracking
- User-defined field mapping
- Machine learning-based matching improvements

## License

This project is open source and available under the MIT License.



### Other Deployment Options

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions on:
- **Netlify** - Similar to Vercel, great for static sites
- **Railway** - Simple cloud platform
- **AWS Amplify** - AWS integration
- **Docker** - Container deployment
- **Traditional VPS** - Self-hosted option

### Live Demo

- Live Demo: [https://smart-reconciliation-visualizer-coral.vercel.app/]

For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md)

## Support

For issues, questions, or contributions, please open an issue in the repository.
