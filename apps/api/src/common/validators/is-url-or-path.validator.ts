import { isURL, registerDecorator, ValidationOptions } from 'class-validator';

/**
 * Same as @IsUrl(), but also accepts a root-relative path such as
 * "/uploads/inventory/abc.jpg" — what UploadsService hands back while no
 * S3-compatible store is configured and files are served straight off the
 * web app's own disk (apps/web/src/app/api/local-uploads). Once S3_* env
 * vars are set, presign() goes back to returning real absolute URLs and
 * this decorator keeps accepting those too.
 */
export function IsUrlOrPath(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isUrlOrPath',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown) {
          if (typeof value !== 'string') return false;
          if (value.startsWith('/')) return true;
          return isURL(value);
        },
        defaultMessage() {
          return `${propertyName} must be a URL address or a local path starting with "/"`;
        },
      },
    });
  };
}
