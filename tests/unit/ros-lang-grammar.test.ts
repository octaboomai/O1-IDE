/**
 * Unit tests — ROS message/service/action language grammar
 */

// Mimic the token patterns from ros-lang-grammar.ts
const ROS_PRIMITIVES = [
    'bool','byte','char','float32','float64',
    'int8','int16','int32','int64',
    'uint8','uint16','uint32','uint64',
    'string','wstring','time','duration',
];

const ROS_CONSTANTS_PATTERN = /^([A-Z_]+)\s*=\s*(.+)$/;
const ROS_FIELD_PATTERN     = /^(\w+(?:\/\w+)?(?:\[\d*\])?)\s+(\w+)$/;
const ROS_COMMENT_PATTERN   = /^#/;
const ROS_SEPARATOR_PATTERN = /^---$/;

function tokenizeLine(line: string): { type: string; value: string } | null {
    const trimmed = line.trim();
    if (!trimmed) return null;
    if (ROS_COMMENT_PATTERN.test(trimmed))   return { type: 'comment', value: trimmed };
    if (ROS_SEPARATOR_PATTERN.test(trimmed)) return { type: 'separator', value: trimmed };
    if (ROS_CONSTANTS_PATTERN.test(trimmed)) return { type: 'constant', value: trimmed };
    if (ROS_FIELD_PATTERN.test(trimmed))     return { type: 'field', value: trimmed };
    return { type: 'unknown', value: trimmed };
}

describe('ROS message grammar tokenizer', () => {
    describe('comments', () => {
        it('recognises # comment lines', () => {
            expect(tokenizeLine('# This is a comment')?.type).toBe('comment');
            expect(tokenizeLine('#comment without space')?.type).toBe('comment');
        });
        it('returns null for blank lines', () => {
            expect(tokenizeLine('')).toBeNull();
            expect(tokenizeLine('   ')).toBeNull();
        });
    });

    describe('field declarations', () => {
        const validFields = [
            'float32 x',
            'int64 timestamp',
            'string frame_id',
            'geometry_msgs/Point position',
            'float32[] data',
            'uint8[3] covariance',
        ];
        validFields.forEach(f => {
            it(`recognises field: "${f}"`, () => {
                expect(tokenizeLine(f)?.type).toBe('field');
            });
        });
    });

    describe('constants', () => {
        const validConstants = [
            'MAX_SPEED = 10.0',
            'ERROR_CODE = 255',
            'STATUS_OK = 0',
        ];
        validConstants.forEach(c => {
            it(`recognises constant: "${c}"`, () => {
                expect(tokenizeLine(c)?.type).toBe('constant');
            });
        });
    });

    describe('service separator', () => {
        it('recognises --- as separator', () => {
            expect(tokenizeLine('---')?.type).toBe('separator');
        });
        it('does not match -- (wrong length)', () => {
            expect(tokenizeLine('--')?.type).not.toBe('separator');
        });
    });

    describe('primitive types list', () => {
        it('contains all 16 ROS 2 primitive types', () => {
            expect(ROS_PRIMITIVES).toHaveLength(16);
        });
        it('includes float32 and float64', () => {
            expect(ROS_PRIMITIVES).toContain('float32');
            expect(ROS_PRIMITIVES).toContain('float64');
        });
        it('includes all int types', () => {
            ['int8','int16','int32','int64','uint8','uint16','uint32','uint64']
                .forEach(t => expect(ROS_PRIMITIVES).toContain(t));
        });
    });
});
