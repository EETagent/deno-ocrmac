#import <Foundation/Foundation.h>
#import <AppKit/AppKit.h>
#import <Vision/Vision.h>

#import <string.h>

// -framework Foundation -framework Vision -framework CoreGraphics

int8_t getTextFromImageByteArray(const uint8_t *buffer, uint64 len, uint8_t recognitionLevel, bool languageCorrection, uint8_t imageOrientation, const char **text, const char **error) {
    @autoreleasepool {
        NSData *data = [NSData dataWithBytes:buffer length:len];

        NSImage *image = [[NSImage alloc] initWithData:data];

        if (image == nil) {
            *error = strdup("Invalid buffer");
            return 4;
        }

        CGImageRef cgImage = [image CGImageForProposedRect:NULL context:NULL hints:NULL];

        VNImageRequestHandler *vnImageHandler = [[VNImageRequestHandler alloc] initWithCGImage:cgImage orientation:imageOrientation
                                                                                       options:@{}];
        __block NSMutableArray<NSDictionary *> *blockOutput = [NSMutableArray new];

        __block NSError *blockError = nil;

        dispatch_semaphore_t semaphore = dispatch_semaphore_create(0);

        VNRecognizeTextRequest *vnTextRequest = [[VNRecognizeTextRequest alloc] initWithCompletionHandler:(VNRequestCompletionHandler) ^(
                VNRequest *_Nonnull request, NSError *_Nullable err) {
            if (err) {
                blockError = [err copy];
                dispatch_semaphore_signal(semaphore);
                return;
            }

            NSArray *results = [request results];
            //NSLog(@"results: %@", results);

            for (VNRecognizedTextObservation *observation in results) {
                CGRect boundingBox = [observation boundingBox];
                double w = boundingBox.size.width, h = boundingBox.size.height;
                double x = boundingBox.origin.x, y = boundingBox.origin.y;

                NSDictionary *result = @{
                        @"text": [[observation topCandidates:1][0] string],
                        @"boundingBox": @{
                                @"x": @(x),
                                @"y": @(y),
                                @"w": @(w),
                                @"h": @(h)
                        }
                };

                [blockOutput addObject:result];
                //NSLog(@"text: %@", result);
                //NSLog(@"text: %@", text);
            }

            dispatch_semaphore_signal(semaphore);
        }];


        [vnTextRequest setRecognitionLevel:recognitionLevel];
        [vnTextRequest setUsesLanguageCorrection:languageCorrection ? YES : NO];

        NSError *requestError = nil;
        [vnImageHandler performRequests:@[vnTextRequest] error:&requestError];

        dispatch_semaphore_wait(semaphore, DISPATCH_TIME_FOREVER);

        if (requestError && error) {
            *error = strdup([[requestError localizedDescription] UTF8String]);
            return 1;
        }

        if (blockError && error) {
            *error = strdup([[blockError localizedDescription] UTF8String]);
            return 2;
        }

        NSError *jsonError = nil;
        NSData *jsonData = [NSJSONSerialization dataWithJSONObject:blockOutput options:NSJSONWritingPrettyPrinted error:&jsonError];

        if (jsonError && error) {
            *error = strdup([[jsonError localizedDescription] UTF8String]);
            return 3;
        }

        NSString *jsonString = [[NSString alloc] initWithData:jsonData encoding:NSUTF8StringEncoding];

        *text = strdup([jsonString UTF8String]);

        return 0;
    }
}

void freeString(char *string) {
    free(string);
}


