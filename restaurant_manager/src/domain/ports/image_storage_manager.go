package ports

import (
	"mime/multipart"
)

type StorageImageManager interface {
	UploadImage(folder string, subfolder string, bucket string, file multipart.File) (string, error)
}
