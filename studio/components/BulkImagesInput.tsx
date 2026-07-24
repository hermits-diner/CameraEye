import { useCallback, useState } from 'react';
import { Button, Card, Dialog, Flex, Stack, Text } from '@sanity/ui';
import { TrashIcon } from '@sanity/icons';
import { unset, type ArrayOfObjectsInputProps } from 'sanity';

/**
 * Default image-array input plus a "delete all" action. Bulk *upload* is
 * native: dropping multiple files onto the array creates one entry per
 * file. Bulk *delete* is what the default UI lacks — this adds it with a
 * confirmation dialog. Asset files themselves stay in the media library.
 */
export function BulkImagesInput(props: ArrayOfObjectsInputProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const count = Array.isArray(props.value) ? props.value.length : 0;

  const clearAll = useCallback(() => {
    props.onChange(unset());
    setConfirmOpen(false);
  }, [props]);

  return (
    <Stack space={3}>
      {props.renderDefault(props)}
      {count > 0 && (
        <Flex justify="flex-end">
          <Button
            icon={TrashIcon}
            mode="ghost"
            tone="critical"
            fontSize={1}
            text={`모든 이미지 삭제 (${count}장)`}
            onClick={() => setConfirmOpen(true)}
          />
        </Flex>
      )}
      {confirmOpen && (
        <Dialog
          header="모든 이미지 삭제"
          id="confirm-clear-all-images"
          width={0}
          onClose={() => setConfirmOpen(false)}
        >
          <Card padding={4}>
            <Stack space={4}>
              <Text size={1}>
                이 프로젝트의 이미지 {count}장을 목록에서 모두 제거할까요?
                업로드된 원본 파일은 미디어 라이브러리에 남아 있으며, 다시
                추가할 수 있습니다.
              </Text>
              <Flex gap={2} justify="flex-end">
                <Button mode="ghost" text="취소" onClick={() => setConfirmOpen(false)} />
                <Button tone="critical" text="모두 삭제" onClick={clearAll} />
              </Flex>
            </Stack>
          </Card>
        </Dialog>
      )}
    </Stack>
  );
}
