import { Modifier, EditorState } from 'draft-js';
import { MentionData } from '..';
import getSearchText from '../utils/getSearchText';
import getTypeByTrigger from '../utils/getTypeByTrigger';

export default function addMention(
  editorState: EditorState,
  mention: MentionData,
  mentionPrefix: string,
  mentionTrigger: string,
  entityMutability: 'SEGMENTED' | 'IMMUTABLE' | 'MUTABLE'
): EditorState {
  const contentStateWithEntity = editorState
    .getCurrentContent()
    .createEntity(getTypeByTrigger(mentionTrigger), entityMutability, {
      mention,
    });
  const entityKey = contentStateWithEntity.getLastCreatedEntityKey();

  const currentSelectionState = editorState.getSelection();
  const { begin, end } = getSearchText(editorState, currentSelectionState, [
    mentionTrigger,
  ]);

  // get selection of the @mention search text
  const mentionTextSelection = currentSelectionState.merge({
    anchorOffset: begin,
    focusOffset: end,
  });

  const mentionReplacedContent = Modifier.replaceText(
    editorState.getCurrentContent(),
    mentionTextSelection,
    `${mentionPrefix}${mention.name}`,
    undefined, // no inline style needed
    entityKey
  );

  const newEditorState = EditorState.push(
    editorState,
    mentionReplacedContent,
    'insert-fragment'
  );
  return EditorState.forceSelection(
    newEditorState,
    mentionReplacedContent.getSelectionAfter()
  );
}
