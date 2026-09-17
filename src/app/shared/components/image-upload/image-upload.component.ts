import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';

@Component({
  selector: 'app-image-upload',
  standalone: true,
  templateUrl: './image-upload.component.html',
  styleUrl: './image-upload.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImageUploadComponent {
  @Input() previewUrl = '';

  @Input() accept = 'image/jpeg,image/png,image/webp';

  @Input() maxSizeMb = 5;

  @Input() disabled = false;

  @Input() label = 'Upload Image';

  @Input() hint =
    'JPG, PNG or WebP. Maximum size 5 MB.';

  @Output() fileSelected =
    new EventEmitter<File>();

  @Output() fileRemoved =
    new EventEmitter<void>();

  @Output() validationError =
    new EventEmitter<string>();

  errorMessage = '';

  isDragging = false;

  private objectUrl = '';

  onFileInput(event: Event): void {
    const input = event.target as HTMLInputElement;

    const file = input.files?.[0];

    if (!file) {
      return;
    }

    this.processFile(file);

    input.value = '';
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();

    if (this.disabled) {
      return;
    }

    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();

    this.isDragging = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();

    this.isDragging = false;

    if (this.disabled) {
      return;
    }

    const file = event.dataTransfer?.files?.[0];

    if (!file) {
      return;
    }

    this.processFile(file);
  }

  removeFile(): void {
    if (this.disabled) {
      return;
    }

    this.errorMessage = '';

    if (this.objectUrl) {
      URL.revokeObjectURL(this.objectUrl);
      this.objectUrl = '';
    }

    this.previewUrl = '';

    this.fileRemoved.emit();
  }

  private processFile(file: File): void {
    this.errorMessage = '';

    const validationError =
      this.validateFile(file);

    if (validationError) {
      this.errorMessage = validationError;
      this.validationError.emit(validationError);
      return;
    }

    if (this.objectUrl) {
      URL.revokeObjectURL(this.objectUrl);
    }

    this.objectUrl = URL.createObjectURL(file);

    this.previewUrl = this.objectUrl;

    this.fileSelected.emit(file);
  }

  private validateFile(file: File): string {
    const allowedTypes =
      this.accept
        .split(',')
        .map((type) => type.trim().toLowerCase())
        .filter(Boolean);

    if (
      allowedTypes.length > 0 &&
      !allowedTypes.includes(
        file.type.toLowerCase(),
      )
    ) {
      return 'Please select a valid image file.';
    }

    const maxSize =
      this.maxSizeMb * 1024 * 1024;

    if (file.size > maxSize) {
      return `Image size must be less than ${this.maxSizeMb} MB.`;
    }

    return '';
  }
}