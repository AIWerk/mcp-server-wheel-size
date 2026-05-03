import * as z from 'zod';
import { fetchApi } from '../api.js';

// wheel-spec-metadata
// Returns computed geometry and population statistics for a given wheel/tyre spec.
// All fields are optional. Provide as many as known for more precise results.

export const wheelSpecMetadataInput = {
  rim_diameter: z
    .number()
    .positive()
    .optional()
    .describe('Rim diameter in inches (e.g. 18). Must be positive.'),
  rim_width: z
    .number()
    .positive()
    .optional()
    .describe('Rim width in inches (e.g. 8.0). Must be positive.'),
  rim_offset: z
    .number()
    .min(-100)
    .max(100)
    .optional()
    .describe(
      'Rim offset (ET) in mm, range -100 to 100 (e.g. 25). Enables geometry and fitment-match estimates when provided.',
    ),
  bolt_pattern: z
    .string()
    .optional()
    .describe(
      'Bolt pattern (PCD) as stud-count × circle-diameter in mm (e.g. "5x114.3"). ' +
      'Narrows population statistics to matching vehicles.',
    ),
  cb: z
    .number()
    .positive()
    .optional()
    .describe('Centre bore diameter in mm (e.g. 71.6). Must be positive. Passed through for package suggestions.'),
  section_width: z
    .number()
    .int()
    .positive()
    .optional()
    .describe('Tyre section width in mm (e.g. 225). Must be positive. Required for tyre/package mode. Mutually exclusive with overall_diameter.'),
  aspect_ratio: z
    .number()
    .int()
    .min(1)
    .max(100)
    .optional()
    .describe('Tyre aspect ratio as a percentage integer 1-100 (e.g. 45). Required for tyre/package mode. Mutually exclusive with overall_diameter.'),
  overall_diameter: z
    .number()
    .positive()
    .optional()
    .describe(
      'Overall tyre diameter in inches (e.g. 33). Must be positive. For high-flotation (HF) tyre mode. ' +
      'Mutually exclusive with section_width/aspect_ratio.',
    ),
  hints: z
    .boolean()
    .optional()
    .describe('Include human-readable fitment hints in the response (default false).'),
};

export type WheelSpecMetadataArgs = {
  rim_diameter?: number;
  rim_width?: number;
  rim_offset?: number;
  bolt_pattern?: string;
  cb?: number;
  section_width?: number;
  aspect_ratio?: number;
  overall_diameter?: number;
  hints?: boolean;
};

export async function wheelSpecMetadata(args: WheelSpecMetadataArgs) {
  const hasOd = args.overall_diameter !== undefined;
  const hasMetric = args.section_width !== undefined || args.aspect_ratio !== undefined;
  if (hasOd && hasMetric) {
    throw new Error(
      'Cannot combine overall_diameter (HF tyre mode) with section_width/aspect_ratio (metric tyre mode). Use one or the other.',
    );
  }
  return fetchApi('/spec/metadata/', args as Record<string, string | number | boolean | undefined | null>);
}
