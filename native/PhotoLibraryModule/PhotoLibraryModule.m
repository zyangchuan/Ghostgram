#import "PhotoLibraryModule.h"
@import Photos;
@import PhotosUI;
@import UIKit;

@interface PhotoLibraryModule()<PHPickerViewControllerDelegate>
@property (nonatomic, strong) void (^singlePickCallback)(NSString * _Nullable);
@property (nonatomic, strong) void (^multiPickCallback)(NSString * _Nullable);
@end

@implementation PhotoLibraryModule

+ (NSString *)name {
  return @"PhotoLibraryModule";
}

+ (NSDictionary<NSString *, NSString *> *)methodLookup {
  return @{
    @"requestAuthorization": NSStringFromSelector(@selector(requestAuthorization:)),
    @"pickPhoto": NSStringFromSelector(@selector(pickPhoto:)),
    @"pickPhotos": NSStringFromSelector(@selector(pickPhotos:))
  };
}

#pragma mark - Helpers

- (UIViewController *)topViewController {
  UIViewController *root = UIApplication.sharedApplication.keyWindow.rootViewController;
  while (root.presentedViewController) { root = root.presentedViewController; }
  return root;
}

- (NSString *)imageToBase64:(UIImage *)image {
  NSData *data = UIImageJPEGRepresentation(image, 0.9); // or PNG if alpha needed
  return [data base64EncodedStringWithOptions:0];
}

#pragma mark - Methods

- (void)requestAuthorization:(void(^)(NSString *status))callback {
  PHAuthorizationStatus status = [PHPhotoLibrary authorizationStatus];
  if (status == PHAuthorizationStatusNotDetermined) {
    [PHPhotoLibrary requestAuthorizationForAccessLevel:PHAccessLevelReadWrite handler:^(PHAuthorizationStatus s) {
      callback([self statusString:s]);
    }];
  } else {
    callback([self statusString:status]);
  }
}

- (NSString *)statusString:(PHAuthorizationStatus)status {
  switch (status) {
    case PHAuthorizationStatusAuthorized: return @"authorized";
    case PHAuthorizationStatusLimited: return @"limited";
    case PHAuthorizationStatusDenied: return @"denied";
    case PHAuthorizationStatusRestricted: return @"denied";
    case PHAuthorizationStatusNotDetermined: return @"not_determined";
    default: return @"denied";
  }
}

- (void)pickPhoto:(void(^)(NSString * _Nullable base64))callback {
    if (@available(iOS 14, *)) {
        dispatch_async(dispatch_get_main_queue(), ^{
            self.singlePickCallback = callback;
            PHPickerConfiguration *config = [[PHPickerConfiguration alloc] init];
            config.selectionLimit = 1;
            config.filter = [PHPickerFilter imagesFilter];
            PHPickerViewController *picker = [[PHPickerViewController alloc] initWithConfiguration:config];
            picker.delegate = self;

            UIViewController *topVC = [self topViewController];
            if (topVC) {
                [topVC presentViewController:picker animated:YES completion:nil];
            } else {
                NSLog(@"No top view controller available");
                callback(nil);
            }
        });
    } else {
        NSLog(@"iOS version too low for PHPickerViewController");
        callback(nil);
    }
}


- (void)pickPhotos:(void(^)(NSString * _Nullable jsonArray))callback {
  self.multiPickCallback = callback;
  PHPickerConfiguration *config = [[PHPickerConfiguration alloc] init];
  config.selectionLimit = 5; // change as you wish
  config.filter = [PHPickerFilter imagesFilter];
  PHPickerViewController *picker = [[PHPickerViewController alloc] initWithConfiguration:config];
  picker.delegate = self;
  [[self topViewController] presentViewController:picker animated:YES completion:nil];
}

#pragma mark - PHPickerViewControllerDelegate

- (void)picker:(PHPickerViewController *)picker didFinishPicking:(NSArray<PHPickerResult *> *)results {
  __weak typeof(self) weakSelf = self;
  if (results.count == 0) {
    if (self.singlePickCallback) self.singlePickCallback(nil);
    if (self.multiPickCallback) self.multiPickCallback(nil);
    [picker dismissViewControllerAnimated:YES completion:nil];
    return;
  }

  NSMutableArray<NSString *> *base64s = [NSMutableArray array];
  dispatch_group_t group = dispatch_group_create();

  for (PHPickerResult *result in results) {
    if (![result.itemProvider canLoadObjectOfClass:UIImage.class]) continue;
    dispatch_group_enter(group);
    [result.itemProvider loadObjectOfClass:UIImage.class completionHandler:^(UIImage * _Nullable image, NSError * _Nullable error) {
      if (image != nil) {
        NSString *b64 = [weakSelf imageToBase64:image];
        @synchronized (base64s) { [base64s addObject:b64]; }
      }
      dispatch_group_leave(group);
    }];
  }

  dispatch_group_notify(group, dispatch_get_main_queue(), ^{
    if (base64s.count == 0) {
      if (weakSelf.singlePickCallback) weakSelf.singlePickCallback(nil);
      if (weakSelf.multiPickCallback) weakSelf.multiPickCallback(nil);
    } else if (base64s.count == 1 && weakSelf.singlePickCallback) {
      weakSelf.singlePickCallback(base64s.firstObject);
    } else if (weakSelf.multiPickCallback) {
      NSData *json = [NSJSONSerialization dataWithJSONObject:base64s options:0 error:nil];
      NSString *jsonStr = [[NSString alloc] initWithData:json encoding:NSUTF8StringEncoding];
      weakSelf.multiPickCallback(jsonStr);
    }
    [picker dismissViewControllerAnimated:YES completion:nil];
    weakSelf.singlePickCallback = nil;
    weakSelf.multiPickCallback = nil;
  });
}

@end
