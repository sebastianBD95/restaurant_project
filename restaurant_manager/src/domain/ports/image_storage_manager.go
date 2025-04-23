package ports

import (
	"mime/multipart"
)

type StorageImageManager interface {
	UploadImage(folder string, bucket string, file multipart.File) (string, error)
}
