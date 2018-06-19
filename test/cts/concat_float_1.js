describe('CTS / Concat float 1 test', function() {
  const assert = chai.assert;
  const nn = navigator.ml.getNeuralNetworkContext();

  it('check result example 1', async function() {
    var model = await nn.createModel();
    var operandIndex = 0;

    let op1_value = [1.0, 2.0, 3.0, 4.0, 5.0, 6.0];
    let op2_value = [7.0, 8.0, 9.0, 10.0, 11.0, 12.0];
    let result_expect = [1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0, 9.0, 10.0, 11.0, 12.0];

    var type1 = {type: nn.INT32};
    var type0 = {type: nn.TENSOR_FLOAT32, dimensions: [2, 3]};
    var type0_length = product(type0.dimensions);
    var type2 = {type: nn.TENSOR_FLOAT32, dimensions: [4, 3]};
    var type2_length = product(type2.dimensions);

    var op1 = operandIndex++;
    model.addOperand(type0);
    var op2 = operandIndex++;
    model.addOperand(type0);
    var axis0 = operandIndex++;
    model.addOperand(type1);
    var result = operandIndex++;
    model.addOperand(type2);

    let op2_input = new Float32Array(op2_value);
    model.setOperandValue(op2, op2_input);

    model.setOperandValue(axis0, new Int32Array([0]));
    model.addOperation(nn.CONCATENATION, [op1, op2, axis0], [result]);

    model.identifyInputsAndOutputs([op1], [result]);
    await model.finish();

    let compilation = await model.createCompilation();
    compilation.setPreference(nn.PREFER_FAST_SINGLE_ANSWER);
    await compilation.finish();

    let execution = await compilation.createExecution();

    let op1_input = new Float32Array(op1_value);
    execution.setInput(0, op1_input);

    let result_output = new Float32Array(type2_length);
    execution.setOutput(0, result_output);

    await execution.startCompute();

    for (let i = 0; i < type2_length; ++i) {
      assert.isTrue(almostEqual(result_output[i], result_expect[i]));
    }
  });
});
