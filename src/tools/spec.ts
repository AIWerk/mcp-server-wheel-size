import * as z from 'zod';
import { fetchApi } from '../api.js';

// wheel-spec-metadata
// Returns computed geometry and population statistics for a given wheel/tyre spec.
// All fields are optional — provide as many as known for more precise results.

export const wheelSpecMetadataInput = {
  rim_diameter: z
    .number()
    .optional()
    .describe('Rim diameter in inches (e.g. 18).'),
  rim_width: z
    .number()
    .optional()
    .describe('Rim width in inches (e.g. 8.0).'),
  rim_offset: z
    .number()
    .optional()
    .describe(
      'Rim offset (ET) in mm (e.g. 25). Enables geometry and fitment-match estimates when provided.',
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
    .optional()
    .describe('Centre bore diameter in mm (e.g. 71.6). Passed through for package suggestions.'),
  section_width: z
    .number()
    .int()
    .optional()
    .describe('Tyre section width in mm (e.g. 225). Required for tyre/package mode.'),
  aspect_ratio: z
    .number()
    .int()
    .optional()
    .describe('Tyre aspect ratio as a percentage integer (e.g. 45). Required for tyre/package mode.'),
  overall_diameter: z
    .number()
    .optional()
    .describe(
      'Overall tyre diameter in inches (e.g. 33). For high-flotation (HF) tyre mode. ' +
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
  return fetchApi('/spec/metadata/', args as Record<string, string | number | boolean | undefined | null>);
}
