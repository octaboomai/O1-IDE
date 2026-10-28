import { injectable, inject } from '@theia/core/shared/inversify';
import { FrontendApplicationContribution } from '@theia/core/lib/browser/frontend-application-contribution';
import { EditorManager } from '@theia/editor/lib/browser/editor-manager';

/**
 * FEATURE: make language detection actually stick.
 *
 * Theia assigns a language when an editor model is created. A file opened before
 * the grammars are registered — or restored from the previous session — keeps
 * `plaintext` forever, which is why files still showed "Plain Text" in the status
 * bar even though the grammars were registered.
 *
 * This re-applies the language by file name/extension: once at startup, and again
 * shortly after any editor is created.
 */
const EXT_TO_LANGUAGE: Record<string, string> = {
    '.py': 'python', '.pyw': 'python', '.pyi': 'python',
    '.c': 'cpp', '.h': 'cpp', '.cc': 'cpp', '.cpp': 'cpp', '.cxx': 'cpp',
    '.hpp': 'cpp', '.hh': 'cpp', '.hxx': 'cpp', '.ino': 'cpp',
    '.cmake': 'cmake',
    '.yaml': 'yaml', '.yml': 'yaml',
    '.xml': 'xml', '.urdf': 'xml', '.xacro': 'xml', '.launch': 'xml',
    '.sdf': 'xml', '.world': 'xml', '.srdf': 'xml',
    '.md': 'markdown', '.markdown': 'markdown',
    '.sh': 'shell', '.bash': 'shell', '.zsh': 'shell',
    '.mk': 'makefile',
    '.ini': 'ini', '.cfg': 'ini', '.conf': 'ini',
    '.lua': 'lua',
    '.rs': 'rust',
    '.proto': 'proto',
};

/** Files identified by name rather than extension. */
const NAME_TO_LANGUAGE: Record<string, string> = {
    'cmakelists.txt': 'cmake',
    'makefile': 'makefile',
    'gnumakefile': 'makefile',
    'dockerfile': 'dockerfile',
    'containerfile': 'dockerfile',
};

@injectable()
export class LanguageActivationContribution implements FrontendApplicationContribution {

    @inject(EditorManager) protected readonly editorManager!: EditorManager;

    onStart(): void {
        this.sweep();
        // New editors get their language re-applied once the model exists.
        this.editorManager.onCreated(() => setTimeout(() => this.sweep(), 300));
    }

    private sweep(): void {
        try {
            for (const model of monaco.editor.getModels()) {
                const id = this.languageFor(model.uri.path);
                if (id && model.getLanguageId() !== id) {
                    monaco.editor.setModelLanguage(model, id);
                }
            }
        } catch (err) {
            console.error('[o1] language activation failed', err);
        }
    }

    private languageFor(path: string): string | undefined {
        const lower = path.toLowerCase();
        const slash = lower.lastIndexOf('/');
        const base = slash >= 0 ? lower.slice(slash + 1) : lower;
        const byName = NAME_TO_LANGUAGE[base];
        if (byName) return byName;
        const dot = lower.lastIndexOf('.');
        if (dot < 0) return undefined;
        return EXT_TO_LANGUAGE[lower.slice(dot)];
    }
}
