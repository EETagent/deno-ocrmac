#import <Foundation/Foundation.h>
#import <AppKit/AppKit.h>
#import <Vision/Vision.h>

// -framework Foundation -framework Vision -framework CoreGraphics

int8_t getTextFromImageByteArray(uint8_t *buffer, uint64 len, uint8_t recognitionLevel, bool languageCorrection, uint8_t imageOrientation, const char **text, const char **error) {
    NSData *data = [NSData dataWithBytes:buffer length:len];
    
    NSImage *image = [[NSImage alloc] initWithData:data];

    CGImageRef cgImage = [image CGImageForProposedRect:NULL context:NULL hints:NULL];

    VNImageRequestHandler *vnImageHandler = [[VNImageRequestHandler alloc] initWithCGImage:cgImage orientation:imageOrientation
                                                                                   options:@{}];
    __block NSMutableArray<NSDictionary *> *blockOutput = [NSMutableArray new];
    
    __block NSError *blockError = nil;

    dispatch_semaphore_t semaphore = dispatch_semaphore_create(0);

    VNRecognizeTextRequest *vnTextRequest = [[VNRecognizeTextRequest alloc] initWithCompletionHandler:(VNRequestCompletionHandler)^(VNRequest * _Nonnull request, NSError * _Nullable err) {
        if (err) {
            blockError = [err copy];
            dispatch_semaphore_signal(semaphore);
            return;
        }

        NSArray *results = [request results];
        //NSLog(@"results: %@", results);

        for (VNRecognizedTextObservation *observation in results) {
            CGRect boundingBox = [observation boundingBox];
            float w = boundingBox.size.width, h = boundingBox.size.height;
            float x = boundingBox.origin.x, y = boundingBox.origin.y;

            NSString *text = [[observation topCandidates:1][0] string];

            NSDictionary *result = @{
                @"text": text,
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
    [vnTextRequest setUsesLanguageCorrection:languageCorrection];

    NSError *requestError = nil;
    [vnImageHandler performRequests:@[vnTextRequest] error:&requestError];

    dispatch_semaphore_wait(semaphore, DISPATCH_TIME_FOREVER);
    
    if (requestError) {
        *error = [[requestError localizedDescription] UTF8String];
        return 1;
    }

    if (blockError) {
        *error = [[blockError localizedDescription] UTF8String];
        return 1;
    }

    NSError *jsonError = nil;
    NSData *jsonData = [NSJSONSerialization dataWithJSONObject:blockOutput options:NSJSONWritingPrettyPrinted error:&jsonError];

    if (jsonError) {
        *error = [[jsonError localizedDescription] UTF8String];
        return 2;
    }

    NSString *jsonString = [[NSString alloc] initWithData:jsonData encoding:NSUTF8StringEncoding]; 

    *text = [jsonString UTF8String];

    return 0;
}